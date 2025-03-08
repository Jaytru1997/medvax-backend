const express = require("express");
const { logInteraction } = require("../controllers/crmController");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/rbacMiddleware");
const { access } = require("../config/access");

/**
 * @swagger
 * /api/crm/log:
 *   post:
 *     summary: Log an interaction
 *     description: Allows a user to log an interaction.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               type:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Interaction logged successfully
 *       500:
 *         description: Server error
 */
router.post("/log", authMiddleware, checkRole(access.all), logInteraction);

module.exports = router;
