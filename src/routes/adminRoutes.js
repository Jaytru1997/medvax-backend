const express = require("express");
const { trainChatbot } = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/rbacMiddleware");
const { access } = require("../config/access");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management
 */

/**
 * @swagger
 * /api/admin/train-chatbot:
 *   post:
 *     summary: Train chat bot
 *     tags: [Admin]
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
router.post(
  "/train-chatbot",
  authMiddleware,
  checkRole(access.admin),
  trainChatbot
); // Admin route to train chatbot

module.exports = router;
