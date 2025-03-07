const express = require("express");
const {
  submitFeedback,
  getAllFeedback,
  getFeedbackAnalytics,
} = require("../controllers/feedbackController");
const { checkRole } = require("../middleware/rbacMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Submit feedback
 *     description: Submit feedback for a user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               feedback:
 *                 type: string
 *     responses:
 *       201:
 *         description: Feedback submitted successfully
 *       500:
 *         description: Server error
 */
router.post("/", submitFeedback);

/**
 * @swagger
 * /api/feedback:
 *   get:
 *     summary: Get all feedback
 *     description: Get all feedback submitted by users.
 *     responses:
 *       200:
 *         description: Feedback retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/", checkRole(["admin"]), getAllFeedback);

/**
 * @swagger
 * /api/feedback/analytics:
 *   get:
 *     summary: Get feedback analytics
 *     description: Get feedback analytics for admin users.
 *     responses:
 *       200:
 *         description: Feedback analytics retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/analytics", checkRole(["admin"]), getFeedbackAnalytics);

module.exports = router;
