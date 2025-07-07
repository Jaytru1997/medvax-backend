const express = require("express");
const {
  chatWithBot,
  getSessionInfo,
  startConversation,
  getSessionStatistics,
  healthCheck,
} = require("../controllers/chatbotController");
const {
  chatbotRateLimiter,
  chatMessageRateLimiter,
  sessionCreationRateLimiter,
} = require("../middleware/rateLimitMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chatbot
 *   description: Chat with MedVax AI
 */

/**
 * @swagger
 * /api/chatbot/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Chatbot]
 *     description: Check the health status of the chatbot service.
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 activeSessions:
 *                   type: number
 *                   description: Number of active sessions
 *                 totalSessions:
 *                   type: number
 *                   description: Total number of sessions
 *                 uptime:
 *                   type: number
 *                   description: Service uptime in seconds
 *       503:
 *         description: Service is unhealthy
 */
router.get("/health", healthCheck);

/**
 * @swagger
 * /api/chatbot/chat:
 *   post:
 *     summary: Chat with the bot
 *     tags: [Chatbot]
 *     description: Allows a user to chat with the bot with session management for multiple concurrent users. Requires a frontend-generated UUID for anonymous users.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - userId
 *             properties:
 *               message:
 *                 type: string
 *                 description: The user's message (max 1000 characters)
 *                 required: true
 *                 maxLength: 1000
 *               userId:
 *                 type: string
 *                 description: Frontend-generated UUID for the user (required for anonymous users)
 *                 required: true
 *                 pattern: '^uuid_\\d+_[a-zA-Z0-9]{9}$|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
 *               sessionId:
 *                 type: string
 *                 description: Custom session identifier (optional, will be generated based on userId)
 *               contextData:
 *                 type: object
 *                 description: Context data to maintain conversation state (max 5KB)
 *     responses:
 *       200:
 *         description: Chat successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *                   description: Bot response text
 *                 intent:
 *                   type: string
 *                   description: Detected intent
 *                 confidence:
 *                   type: number
 *                   description: Confidence score
 *                 sessionId:
 *                   type: string
 *                   description: Session identifier
 *                 context:
 *                   type: object
 *                   description: Conversation context
 *                 parameters:
 *                   type: object
 *                   description: Extracted parameters
 *                 action:
 *                   type: string
 *                   description: Action to perform
 *                 allRequiredParamsPresent:
 *                   type: boolean
 *                   description: Whether all required parameters are present
 *                 userId:
 *                   type: string
 *                   description: User identifier (frontend-generated UUID)
 *                 language:
 *                   type: string
 *                   description: Detected user language
 *       400:
 *         description: Bad request - validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                 code:
 *                   type: string
 *                   description: Error code
 *                   enum: [MISSING_MESSAGE, MISSING_USER_ID, INVALID_USER_ID, INVALID_MESSAGE, INVALID_CONTEXT]
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Rate limit exceeded"
 *                 message:
 *                   type: string
 *                   description: Rate limit message
 *                 retryAfter:
 *                   type: number
 *                   description: Seconds to wait before retrying
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                 code:
 *                   type: string
 *                   description: Error code
 *                   enum: [DIALOGFLOW_ERROR, INTERNAL_ERROR]
 */
router.post("/chat", chatMessageRateLimiter, chatWithBot);

/**
 * @swagger
 * /api/chatbot/session/{userId}:
 *   get:
 *     summary: Get session information for a user
 *     tags: [Chatbot]
 *     description: Retrieve session information for a specific user using their frontend-generated UUID.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^uuid_\\d+_[a-zA-Z0-9]{9}$|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
 *         description: Frontend-generated UUID for the user
 *     responses:
 *       200:
 *         description: Session information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   description: User identifier (frontend-generated UUID)
 *                 sessionId:
 *                   type: string
 *                   description: Session identifier
 *                 isActive:
 *                   type: boolean
 *                   description: Whether the session is active
 *                 messageCount:
 *                   type: number
 *                   description: Number of messages in this session
 *                 lastActivity:
 *                   type: string
 *                   format: date-time
 *                   description: Last activity timestamp
 *       400:
 *         description: Bad request - missing or invalid userId
 *       500:
 *         description: Server error
 */
router.get("/session/:userId", chatbotRateLimiter, getSessionInfo);

/**
 * @swagger
 * /api/chatbot/start-conversation:
 *   post:
 *     summary: Start a new conversation session
 *     tags: [Chatbot]
 *     description: Initialize a new conversation session for a user using their frontend-generated UUID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: Frontend-generated UUID for the user (required)
 *                 required: true
 *                 pattern: '^uuid_\\d+_[a-zA-Z0-9]{9}$|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
 *     responses:
 *       200:
 *         description: Conversation started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 userId:
 *                   type: string
 *                   description: User identifier (frontend-generated UUID)
 *                 sessionId:
 *                   type: string
 *                   description: Session identifier
 *                 isActive:
 *                   type: boolean
 *                   description: Whether the session is active
 *       400:
 *         description: Bad request - missing or invalid userId
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Server error
 */
router.post(
  "/start-conversation",
  sessionCreationRateLimiter,
  startConversation
);

/**
 * @swagger
 * /api/chatbot/admin/statistics:
 *   get:
 *     summary: Get session statistics (Admin only)
 *     tags: [Chatbot]
 *     description: Retrieve comprehensive session statistics for monitoring and administration.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalSessions:
 *                       type: number
 *                       description: Total number of sessions
 *                     activeSessions:
 *                       type: number
 *                       description: Number of active sessions
 *                     expiredSessions:
 *                       type: number
 *                       description: Number of expired sessions
 *                     avgMessagesPerSession:
 *                       type: number
 *                       description: Average messages per session
 *                     totalMessages:
 *                       type: number
 *                       description: Total messages across all sessions
 *                     cleanupNeeded:
 *                       type: boolean
 *                       description: Whether cleanup is needed
 *       401:
 *         description: Unauthorized - admin access required
 *       500:
 *         description: Server error
 */
router.get("/admin/statistics", chatbotRateLimiter, getSessionStatistics);

module.exports = router;
