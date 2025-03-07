const dialogflow = require("@google-cloud/dialogflow");
const uuid = require("uuid");
const path = require("path");
const { GoogleAuth } = require("google-auth-library");
require("dotenv").config();

const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const sessionClient = new dialogflow.SessionsClient({
  keyFilename: path.join(__dirname, "../config/medvax-dialogflow-key.json"),
});
const intentsClient = new dialogflow.IntentsClient({
  keyFilename: path.join(__dirname, "../config/medvax-dialogflow-key.json"),
});

/**
 * Send user input to Dialogflow and get a response
 * @param {string} userMessage - The message from the user
 * @param {string} sessionId - Unique session identifier
 */
const sendToDialogflow = async (userMessage, sessionId = uuid.v4()) => {
  try {
    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      sessionId
    );

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: userMessage,
          languageCode: "en",
        },
      },
    };

    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    return {
      text: result.fulfillmentText,
      intent: result.intent.displayName,
      confidence: result.intentDetectionConfidence,
    };
  } catch (error) {
    console.error("Dialogflow Error:", error);
    return {
      text: "I'm sorry, I couldn't understand that.",
      intent: "fallback",
    };
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
    console.log(`Intent ${response.displayName} created successfully!`);
    return { message: `Intent ${response.displayName} added!` };
  } catch (error) {
    console.error("Dialogflow Training Error:", error);
    return { error: "Failed to train chatbot" };
  }
};

module.exports = { sendToDialogflow, trainDialogflow };
