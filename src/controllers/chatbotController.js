const { sendToDialogflow } = require("../services/dialogflowService");
const {
  detectLanguage,
  translateText,
} = require("../services/translateService");

exports.chatWithBot = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Detect user language
    const userLanguage = await detectLanguage(message);

    // Send user message to Dialogflow
    const botResponse = await sendToDialogflow(message);

    // Translate chatbot response if necessary
    const translatedResponse =
      userLanguage !== "en"
        ? await translateText(botResponse.text, userLanguage)
        : botResponse.text;

    res.status(200).json({
      text: translatedResponse,
      intent: botResponse.intent,
      confidence: botResponse.confidence,
    });
  } catch (error) {
    res.status(500).json({ error: "Error processing chatbot request" });
  }
};
