const express = require("express");
const { getAvailableSlots, bookAppointment, cancelAppointment } = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/slots", authMiddleware, getAvailableSlots);
router.post("/book", authMiddleware, bookAppointment);
router.delete("/cancel/:bookingId", authMiddleware, cancelAppointment);

module.exports = router;
