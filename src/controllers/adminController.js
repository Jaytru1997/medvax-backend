const { trainDialogflow } = require("../services/dialogflowService");

exports.trainChatbot = async (req, res) => {
  try {
    const { intentName, trainingPhrases, responseText } = req.body;

    if (!intentName || !trainingPhrases || !responseText) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const result = await trainDialogflow(
      intentName,
      trainingPhrases,
      responseText
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error training chatbot" });
  }
};
