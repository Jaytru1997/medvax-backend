const dialogflow = require("@google-cloud/dialogflow");
const uuid = require("uuid");
const path = require("path");
const { GoogleAuth } = require("google-auth-library");
const SessionService = require("./sessionService");
const {
  isValidUUID,
  validateUserMessage,
  validateContextData,
  performSecurityCheck,
} = require("../utils/validation");
const logger = require("./logger");
require("dotenv").config();

const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const sessionClient = new dialogflow.SessionsClient({
  keyFilename: path.join(__dirname, process.env.DIALOGFLOW_KEY_PATH),
});
const intentsClient = new dialogflow.IntentsClient({
  keyFilename: path.join(__dirname, process.env.DIALOGFLOW_KEY_PATH),
});

/**
 * Send user input to Dialogflow and get a response
 * @param {string} userMessage - The message from the user
 * @param {string} userId - Unique identifier for the user (can be frontend-generated UUID for anonymous users)
 * @param {string} sessionId - Optional custom session identifier (if not provided, will be generated/retrieved based on userId)
 * @param {Object} contextData - Optional context data to maintain conversation state
 * @param {Object} req - Express request object for security checks
 */
const sendToDialogflow = async (
  userMessage,
  userId,
  sessionId = null,
  contextData = {},
  req = null
) => {
  try {
    // Validate required parameters
    if (!userMessage) {
      throw new Error("User message is required");
    }

    if (!userId) {
      throw new Error("User ID is required for session management");
    }

    // Validate UUID format
    if (!isValidUUID(userId)) {
      throw new Error("Invalid user ID format");
    }

    // Validate and sanitize user message
    const messageValidation = validateUserMessage(userMessage);
    if (!messageValidation.isValid) {
      throw new Error(
        `Message validation failed: ${messageValidation.errors.join(", ")}`
      );
    }

    // Validate context data
    const contextValidation = validateContextData(contextData);
    if (!contextValidation.isValid) {
      throw new Error(
        `Context validation failed: ${contextValidation.errors.join(", ")}`
      );
    }

    // Perform security check if request object is provided
    if (req) {
      const securityCheck = performSecurityCheck(req);
      if (securityCheck.isSuspicious) {
        logger.warn(
          `Suspicious request detected for user ${userId}: ${securityCheck.reasons.join(
            ", "
          )}`
        );
        // Don't block the request but log it for monitoring
      }
    }

    // Get or create session using database storage
    const sessionInfo = await SessionService.getOrCreateSession(userId, req);
    const finalSessionId = sessionId || sessionInfo.sessionId;

    // Update session context if provided
    if (Object.keys(contextValidation.sanitizedContext).length > 0) {
      await SessionService.updateSessionContext(
        userId,
        contextValidation.sanitizedContext
      );
    }

    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      finalSessionId
    );

    // Prepare context parameters if provided
    const contextParameters =
      Object.keys(contextValidation.sanitizedContext).length > 0
        ? {
            parameters: {
              fields: Object.entries(contextValidation.sanitizedContext).reduce(
                (acc, [key, value]) => {
                  acc[key] = { stringValue: value.toString() };
                  return acc;
                },
                {}
              ),
            },
          }
        : null;

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: messageValidation.sanitizedMessage,
          languageCode: "en",
        },
      },
      // Add context if provided
      ...(contextParameters && {
        queryParams: { contexts: [contextParameters] },
      }),
    };

    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    // Extract context from the response if available
    const outputContexts = result.outputContexts || [];
    const extractedContext = {};

    if (outputContexts.length > 0) {
      const context = outputContexts[0];
      if (context.parameters && context.parameters.fields) {
        Object.entries(context.parameters.fields).forEach(([key, field]) => {
          if (field.stringValue) {
            extractedContext[key] = field.stringValue;
          }
        });
      }
    }

    // Update session context with extracted context
    if (Object.keys(extractedContext).length > 0) {
      await SessionService.updateSessionContext(userId, extractedContext);
    }

    logger.info(
      `Dialogflow response for user ${userId}: intent=${result.intent.displayName}, confidence=${result.intentDetectionConfidence}`
    );

    return {
      text: result.fulfillmentText,
      intent: result.intent.displayName,
      confidence: result.intentDetectionConfidence,
      sessionId: finalSessionId,
      context: extractedContext,
      // Include additional metadata
      parameters: result.parameters ? result.parameters.fields : {},
      action: result.action,
      allRequiredParamsPresent: result.allRequiredParamsPresent || false,
      userId: userId, // Return the userId for frontend reference
    };
  } catch (error) {
    logger.error(`Dialogflow Error for user ${userId}: ${error.message}`);

    // Return a fallback response
    return {
      text: "I'm sorry, I couldn't understand that. Please try again.",
      intent: "fallback",
      sessionId:
        sessionId ||
        (userId
          ? await SessionService.getSessionInfo(userId).then(
              (info) => info.sessionId
            )
          : uuid.v4()),
      context: {},
      confidence: 0,
      userId: userId,
      error: error.message,
    };
  }
};

/**
 * Get session information for a user
 * @param {string} userId - User identifier
 * @returns {Object} Session information
 */
const getSessionInfo = async (userId) => {
  try {
    if (!isValidUUID(userId)) {
      throw new Error("Invalid user ID format");
    }

    return await SessionService.getSessionInfo(userId);
  } catch (error) {
    logger.error(
      `Error getting session info for user ${userId}: ${error.message}`
    );
    throw error;
  }
};

/**
 * Get all active sessions (for monitoring purposes)
 * @returns {Array} Array of active session information
 */
const getAllActiveSessions = async () => {
  try {
    return await SessionService.getAllActiveSessions();
  } catch (error) {
    logger.error(`Error getting all active sessions: ${error.message}`);
    throw error;
  }
};

/**
 * Clean up specific user session
 * @param {string} userId - User identifier
 * @returns {boolean} Success status
 */
const cleanupSession = async (userId) => {
  try {
    if (!isValidUUID(userId)) {
      throw new Error("Invalid user ID format");
    }

    return await SessionService.deactivateSession(userId);
  } catch (error) {
    logger.error(
      `Error cleaning up session for user ${userId}: ${error.message}`
    );
    throw error;
  }
};

/**
 * Clean up all sessions (for maintenance purposes)
 * @returns {number} Number of sessions cleaned up
 */
const cleanupAllSessions = async () => {
  try {
    return await SessionService.cleanupExpiredSessions();
  } catch (error) {
    logger.error(`Error cleaning up all sessions: ${error.message}`);
    throw error;
  }
};

/**
 * Get active session count for monitoring
 * @returns {number} Number of active sessions
 */
const getActiveSessionCount = async () => {
  try {
    return await SessionService.getActiveSessionCount();
  } catch (error) {
    logger.error(`Error getting active session count: ${error.message}`);
    throw error;
  }
};

/**
 * Get session statistics for monitoring
 * @returns {Object} Session statistics
 */
const getSessionStatistics = async () => {
  try {
    return await SessionService.getSessionStatistics();
  } catch (error) {
    logger.error(`Error getting session statistics: ${error.message}`);
    throw error;
  }
};

/**
 * Train Dialogflow with a new intent dynamically.
 * @param {string} intentName - The name of the new intent.
 * @param {string[]} trainingPhrases - Examples of how users might ask questions.
 * @param {string} responseText - The chatbot response for this intent.
 */
const trainDialogflow = async (intentName, trainingPhrases, responseText) => {
  try {
    const agentPath = intentsClient.projectAgentPath(projectId);

    const trainingPhrasesParts = trainingPhrases.map((phrase) => ({
      type: "EXAMPLE",
      parts: [{ text: phrase }],
    }));

    const intent = {
      displayName: intentName,
      trainingPhrases: trainingPhrasesParts,
      messages: [{ text: { text: [responseText] } }],
    };

    const request = {
      parent: agentPath,
      intent: intent,
    };

    const [response] = await intentsClient.createIntent(request);
    logger.info(`Intent ${response.displayName} created successfully!`);
    return { message: `Intent ${response.displayName} added!` };
  } catch (error) {
    logger.error("Dialogflow Training Error:", error);
    return { error: "Failed to train chatbot" };
  }
};

module.exports = {
  sendToDialogflow,
  trainDialogflow,
  getSessionInfo,
  getAllActiveSessions,
  cleanupSession,
  cleanupAllSessions,
  getActiveSessionCount,
  getSessionStatistics,
};
