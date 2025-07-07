const {
  sendToDialogflow,
  getSessionInfo,
  getSessionStatistics,
} = require("../services/dialogflowService");
const {
  detectLanguage,
  translateText,
} = require("../services/translateService");
const { asyncWrapper } = require("../utils/async");
const {
  isValidUUID,
  validateUserMessage,
  validateContextData,
} = require("../utils/validation");
const logger = require("../services/logger");

exports.chatWithBot = asyncWrapper(async (req, res) => {
  try {
    const { message, userId, sessionId, contextData } = req.body;

    // Validate required fields
    if (!message) {
      return res.status(400).json({
        error: "Message is required",
        code: "MISSING_MESSAGE",
      });
    }

    if (!userId) {
      return res.status(400).json({
        error:
          "User ID is required. Please provide a unique identifier from the frontend.",
        code: "MISSING_USER_ID",
      });
    }

    // Validate UUID format
    if (!isValidUUID(userId)) {
      return res.status(400).json({
        error: "Invalid user ID format. Please provide a valid UUID.",
        code: "INVALID_USER_ID",
      });
    }

    // Validate message
    const messageValidation = validateUserMessage(message);
    if (!messageValidation.isValid) {
      return res.status(400).json({
        error: `Message validation failed: ${messageValidation.errors.join(
          ", "
        )}`,
        code: "INVALID_MESSAGE",
      });
    }

    // Validate context data
    const contextValidation = validateContextData(contextData || {});
    if (!contextValidation.isValid) {
      return res.status(400).json({
        error: `Context validation failed: ${contextValidation.errors.join(
          ", "
        )}`,
        code: "INVALID_CONTEXT",
      });
    }

    // Log request for monitoring
    logger.info(
      `Chat request from user ${userId}: message length=${
        message.length
      }, has context=${!!contextData}`
    );

    // Detect user language
    let userLanguage = "en";
    try {
      userLanguage = await detectLanguage(message);
    } catch (error) {
      logger.warn(
        `Language detection failed for user ${userId}: ${error.message}`
      );
      // Continue with default language
    }

    // Send user message to Dialogflow with proper session management
    const botResponse = await sendToDialogflow(
      message,
      userId,
      sessionId,
      contextValidation.sanitizedContext,
      req
    );

    // Handle Dialogflow errors
    if (botResponse.error) {
      logger.error(`Dialogflow error for user ${userId}: ${botResponse.error}`);
      return res.status(500).json({
        error: "Error processing your message. Please try again.",
        code: "DIALOGFLOW_ERROR",
      });
    }

    // Translate chatbot response if necessary
    let translatedResponse = botResponse.text;
    try {
      if (userLanguage !== "en") {
        translatedResponse = await translateText(
          botResponse.text,
          userLanguage
        );
      }
    } catch (error) {
      logger.warn(`Translation failed for user ${userId}: ${error.message}`);
      // Continue with original response
    }

    // Log successful response
    logger.info(
      `Chat response for user ${userId}: intent=${botResponse.intent}, confidence=${botResponse.confidence}`
    );

    res.status(200).json({
      text: translatedResponse,
      intent: botResponse.intent,
      confidence: botResponse.confidence,
      sessionId: botResponse.sessionId,
      context: botResponse.context,
      parameters: botResponse.parameters,
      action: botResponse.action,
      allRequiredParamsPresent: botResponse.allRequiredParamsPresent,
      userId: botResponse.userId,
      language: userLanguage,
    });
  } catch (error) {
    logger.error(`Chatbot Controller Error: ${error.message}`, {
      userId: req.body?.userId,
      messageLength: req.body?.message?.length,
      stack: error.stack,
    });

    res.status(500).json({
      error: "Error processing chatbot request. Please try again later.",
      code: "INTERNAL_ERROR",
    });
  }
});

/**
 * Get session information for a user
 */
exports.getSessionInfo = asyncWrapper(async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: "User ID is required",
        code: "MISSING_USER_ID",
      });
    }

    if (!isValidUUID(userId)) {
      return res.status(400).json({
        error: "Invalid user ID format",
        code: "INVALID_USER_ID",
      });
    }

    const sessionInfo = await getSessionInfo(userId);

    logger.info(
      `Session info retrieved for user ${userId}: active=${sessionInfo.isActive}`
    );

    res.status(200).json(sessionInfo);
  } catch (error) {
    logger.error(`Get Session Info Error: ${error.message}`, {
      userId: req.params?.userId,
      stack: error.stack,
    });

    res.status(500).json({
      error: "Error retrieving session information",
      code: "INTERNAL_ERROR",
    });
  }
});

/**
 * Start a new conversation session
 */
exports.startConversation = asyncWrapper(async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error:
          "User ID is required. Please provide a unique identifier from the frontend.",
        code: "MISSING_USER_ID",
      });
    }

    if (!isValidUUID(userId)) {
      return res.status(400).json({
        error: "Invalid user ID format. Please provide a valid UUID.",
        code: "INVALID_USER_ID",
      });
    }

    // Get session info (this will create a new session if one doesn't exist)
    const sessionInfo = await getSessionInfo(userId);

    logger.info(
      `Conversation started for user ${userId}: sessionId=${sessionInfo.sessionId}`
    );

    res.status(200).json({
      message: "Conversation started successfully",
      userId: userId,
      sessionId: sessionInfo.sessionId,
      isActive: sessionInfo.isActive,
    });
  } catch (error) {
    logger.error(`Start Conversation Error: ${error.message}`, {
      userId: req.body?.userId,
      stack: error.stack,
    });

    res.status(500).json({
      error: "Error starting conversation",
      code: "INTERNAL_ERROR",
    });
  }
});

/**
 * Get session statistics (admin endpoint)
 */
exports.getSessionStatistics = asyncWrapper(async (req, res) => {
  try {
    const stats = await getSessionStatistics();

    logger.info(
      `Session statistics retrieved: active=${stats.activeSessions}, total=${stats.totalSessions}`
    );

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error(`Get Session Statistics Error: ${error.message}`, {
      stack: error.stack,
    });

    res.status(500).json({
      error: "Error retrieving session statistics",
      code: "INTERNAL_ERROR",
    });
  }
});

/**
 * Health check endpoint
 */
exports.healthCheck = asyncWrapper(async (req, res) => {
  try {
    const stats = await getSessionStatistics();

    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      activeSessions: stats.activeSessions,
      totalSessions: stats.totalSessions,
      uptime: process.uptime(),
    });
  } catch (error) {
    logger.error(`Health check failed: ${error.message}`);

    res.status(503).json({
      status: "unhealthy",
      error: "Service unavailable",
      timestamp: new Date().toISOString(),
    });
  }
});
