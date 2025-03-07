const express = require("express");
const { trainChatbot } = require("../controllers/adminController");

const router = express.Router();

/**
 * @swagger
 * /api/admin/train-chatbot:
 *   post:
 *     summary: Train chat bot
 *     description: Allows admin to train medvax chat bot.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               intentName:
 *                 type: string
 *               trainingPhrases:
 *                 type: string
 *               responseText:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chat successful
 *       400:
 *         description: Incomplete input
 *       500:
 *         description: Server error
 */
router.post("/train-chatbot", trainChatbot); // Admin route to train chatbot

module.exports = router;
