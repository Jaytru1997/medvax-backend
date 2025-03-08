const express = require("express");
const {
  createNotification,
  getUserNotifications,
} = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/rbacMiddleware");
const { access } = require("../config/access");

const router = express.Router();

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a notification
 *     description: Create a notification for a user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       500:
 *         description: Server error
 */
router.post("/", authMiddleware, checkRole(access.all), createNotification);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     description: Get all notifications for a user.
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, checkRole(access.all), getUserNotifications);

module.exports = router;
