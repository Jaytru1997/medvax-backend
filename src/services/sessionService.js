const ChatSession = require("../models/ChatSession");
const { v4: uuidv4 } = require("uuid");
const {
  isValidUUID,
  getClientIP,
  getUserAgent,
  performSecurityCheck,
} = require("../utils/validation");
const logger = require("./logger");

/**
 * Session Management Service
 * Handles all session-related operations with database storage
 */
class SessionService {
  /**
   * Create or retrieve a session for a user
   * @param {string} userId - User identifier
   * @param {Object} req - Express request object
   * @returns {Object} Session information
   */
  static async getOrCreateSession(userId, req) {
    try {
      // Validate userId
      if (!isValidUUID(userId)) {
        throw new Error("Invalid user ID format");
      }

      // Check for existing active session
      let session = await ChatSession.findOne({
        userId,
        isActive: true,
      });

      if (session) {
        // Update last activity
        await session.updateActivity();
        logger.info(`Session updated for user: ${userId}`);
        return {
          userId: session.userId,
          sessionId: session.sessionId,
          isActive: session.isActive,
          messageCount: session.messageCount,
          lastActivity: session.lastActivity,
        };
      }

      // Create new session
      const sessionId = uuidv4();
      const ipAddress = getClientIP(req);
      const userAgent = getUserAgent(req);

      session = new ChatSession({
        userId,
        sessionId,
        ipAddress,
        userAgent,
        contextData: {},
      });

      await session.save();
      logger.info(
        `New session created for user: ${userId}, session: ${sessionId}`
      );

      return {
        userId: session.userId,
        sessionId: session.sessionId,
        isActive: session.isActive,
        messageCount: session.messageCount,
        lastActivity: session.lastActivity,
      };
    } catch (error) {
      logger.error(`Error in getOrCreateSession: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get session information
   * @param {string} userId - User identifier
   * @returns {Object} Session information
   */
  static async getSessionInfo(userId) {
    try {
      if (!isValidUUID(userId)) {
        throw new Error("Invalid user ID format");
      }

      const session = await ChatSession.findOne({
        userId,
        isActive: true,
      });

      if (!session) {
        return {
          userId,
          sessionId: null,
          isActive: false,
        };
      }

      return {
        userId: session.userId,
        sessionId: session.sessionId,
        isActive: session.isActive,
        messageCount: session.messageCount,
        lastActivity: session.lastActivity,
      };
    } catch (error) {
      logger.error(`Error in getSessionInfo: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update session context
   * @param {string} userId - User identifier
   * @param {Object} contextData - New context data
   * @returns {Object} Updated session
   */
  static async updateSessionContext(userId, contextData) {
    try {
      const session = await ChatSession.findOne({
        userId,
        isActive: true,
      });

      if (!session) {
        throw new Error("No active session found");
      }

      session.contextData = { ...session.contextData, ...contextData };
      await session.save();

      logger.info(`Session context updated for user: ${userId}`);
      return session;
    } catch (error) {
      logger.error(`Error in updateSessionContext: ${error.message}`);
      throw error;
    }
  }

  /**
   * Deactivate a session
   * @param {string} userId - User identifier
   * @returns {boolean} Success status
   */
  static async deactivateSession(userId) {
    try {
      const session = await ChatSession.findOne({
        userId,
        isActive: true,
      });

      if (!session) {
        return false;
      }

      await session.deactivate();
      logger.info(`Session deactivated for user: ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Error in deactivateSession: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all active sessions (for monitoring)
   * @returns {Array} Array of active sessions
   */
  static async getAllActiveSessions() {
    try {
      const sessions = await ChatSession.find({ isActive: true })
        .select("userId sessionId lastActivity messageCount createdAt")
        .sort({ lastActivity: -1 });

      return sessions.map((session) => ({
        userId: session.userId,
        sessionId: session.sessionId,
        lastActivity: session.lastActivity,
        messageCount: session.messageCount,
        createdAt: session.createdAt,
      }));
    } catch (error) {
      logger.error(`Error in getAllActiveSessions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get active session count
   * @returns {number} Number of active sessions
   */
  static async getActiveSessionCount() {
    try {
      return await ChatSession.getActiveSessionCount();
    } catch (error) {
      logger.error(`Error in getActiveSessionCount: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cleanup expired sessions
   * @returns {number} Number of sessions cleaned up
   */
  static async cleanupExpiredSessions() {
    try {
      const cleanedCount = await ChatSession.cleanupExpiredSessions();
      logger.info(`Cleaned up ${cleanedCount} expired sessions`);
      return cleanedCount;
    } catch (error) {
      logger.error(`Error in cleanupExpiredSessions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get sessions for a specific user
   * @param {string} userId - User identifier
   * @returns {Array} Array of user sessions
   */
  static async getUserSessions(userId) {
    try {
      if (!isValidUUID(userId)) {
        throw new Error("Invalid user ID format");
      }

      return await ChatSession.getUserSessions(userId);
    } catch (error) {
      logger.error(`Error in getUserSessions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Perform security check on request
   * @param {Object} req - Express request object
   * @returns {Object} Security check result
   */
  static performSecurityCheck(req) {
    return performSecurityCheck(req);
  }

  /**
   * Get session statistics
   * @returns {Object} Session statistics
   */
  static async getSessionStatistics() {
    try {
      const totalSessions = await ChatSession.countDocuments();
      const activeSessions = await ChatSession.countDocuments({
        isActive: true,
      });
      const expiredSessions = await ChatSession.countDocuments({
        expiresAt: { $lt: new Date() },
        isActive: true,
      });

      // Get average messages per session
      const avgMessagesResult = await ChatSession.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            avgMessages: { $avg: "$messageCount" },
            totalMessages: { $sum: "$messageCount" },
          },
        },
      ]);

      const avgMessages =
        avgMessagesResult.length > 0 ? avgMessagesResult[0].avgMessages : 0;
      const totalMessages =
        avgMessagesResult.length > 0 ? avgMessagesResult[0].totalMessages : 0;

      return {
        totalSessions,
        activeSessions,
        expiredSessions,
        avgMessagesPerSession: Math.round(avgMessages * 100) / 100,
        totalMessages,
        cleanupNeeded: expiredSessions > 0,
      };
    } catch (error) {
      logger.error(`Error in getSessionStatistics: ${error.message}`);
      throw error;
    }
  }
}

module.exports = SessionService;
