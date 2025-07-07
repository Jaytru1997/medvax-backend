const SessionService = require("./sessionService");
const logger = require("./logger");

/**
 * Automatic Cleanup Service
 * Handles periodic cleanup of expired sessions and other maintenance tasks
 */
class CleanupService {
  constructor() {
    this.cleanupInterval = null;
    this.isRunning = false;
  }

  /**
   * Start the automatic cleanup service
   * @param {number} intervalMinutes - Cleanup interval in minutes (default: 60)
   */
  start(intervalMinutes = 60) {
    if (this.isRunning) {
      logger.warn("Cleanup service is already running");
      return;
    }

    this.isRunning = true;
    const intervalMs = intervalMinutes * 60 * 1000;

    // Run initial cleanup
    this.performCleanup();

    // Schedule periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, intervalMs);

    logger.info(
      `Cleanup service started with ${intervalMinutes} minute interval`
    );
  }

  /**
   * Stop the automatic cleanup service
   */
  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.isRunning = false;
    logger.info("Cleanup service stopped");
  }

  /**
   * Perform cleanup tasks
   */
  async performCleanup() {
    try {
      logger.info("Starting scheduled cleanup...");

      // Cleanup expired sessions
      const cleanedSessions = await SessionService.cleanupExpiredSessions();

      // Get statistics for monitoring
      const stats = await SessionService.getSessionStatistics();

      logger.info(
        `Cleanup completed: ${cleanedSessions} sessions cleaned, ${stats.activeSessions} active sessions remaining`
      );

      // Log warning if too many active sessions
      if (stats.activeSessions > 1000) {
        logger.warn(`High number of active sessions: ${stats.activeSessions}`);
      }

      // Log if cleanup is needed but no sessions were cleaned
      if (stats.cleanupNeeded && cleanedSessions === 0) {
        logger.warn(
          "Cleanup needed but no sessions were cleaned - possible issue"
        );
      }
    } catch (error) {
      logger.error(`Error during cleanup: ${error.message}`);
    }
  }

  /**
   * Force immediate cleanup
   */
  async forceCleanup() {
    try {
      logger.info("Forcing immediate cleanup...");
      await this.performCleanup();
      logger.info("Force cleanup completed");
    } catch (error) {
      logger.error(`Error during force cleanup: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get service status
   * @returns {Object} Service status information
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      interval: this.cleanupInterval ? "active" : "inactive",
      lastCleanup: new Date().toISOString(),
    };
  }
}

// Create singleton instance
const cleanupService = new CleanupService();

module.exports = cleanupService;
