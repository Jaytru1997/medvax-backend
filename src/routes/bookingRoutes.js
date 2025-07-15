const express = require("express");
const {
  getAvailableSlots,
  bookAppointment,
  cancelAppointment,
} = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/rbacMiddleware");
const { access } = require("../config/access");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Booking
 *   description: Booking management
 */

/**
 * @swagger
 * /api/bookings/slots:
 *   get:
 *     summary: Get available slots
 *     tags: [Booking]
 *     description: Allows a user to get available slots.
 *     parameters:
 *       - in: path
 *         event_type: event type slug e.g 1v1-session
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Available slots retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/slots/:event_type", getAvailableSlots);

/**
 * @swagger
 * /api/bookings/book:
 *   post:
 *     summary: Book an appointment
 *     tags: [Booking]
 *     description: Allows a user to book an appointment.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slotId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *       400:
 *         description: All fields are required
 *       500:
 *         description: Server error
 */
router.post("/book", bookAppointment);

/**
 * @swagger
 * /api/bookings/cancel/{bookingId}:
 *   delete:
 *     summary: Cancel an appointment
 *     tags: [Booking]
 *     description: Allows a user to cancel an appointment.
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         description: ID of the booking
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment canceled successfully
 *       500:
 *         description: Server error
 */
router.delete(
  "/cancel/:bookingId",
  authMiddleware,
  checkRole(access.all),
  cancelAppointment
);

module.exports = router;
