const express = require("express");
const { chatWithBot } = require("../controllers/chatbotController");

const router = express.Router();

/**
 * @swagger
 * /api/chatbot/chat:
 *   post:
 *     summary: Chat with the bot
 *     description: Allows a user to chat with the bot.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chat successful
 *       500:
 *         description: Server error
 */
router.post("/chat", chatWithBot);

module.exports = router;
