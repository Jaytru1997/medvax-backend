const axios = require("axios");
require("dotenv").config();
const { asyncWrapper } = require("../utils/async");

const CALCOM_API_BASE = process.env.CALCOM_API_BASE;
const CALCOM_API_KEY = process.env.CALCOM_API_KEY;

// Get available appointment slots
exports.getAvailableSlots = asyncWrapper(async (req, res) => {
  try {
    const { professionalId } = req.query;

    if (!professionalId) {
      return res.status(400).json({ message: "Professional ID is required" });
    }

    const response = await axios.get(
      `${CALCOM_API_BASE}/availability/${professionalId}`,
      {
        headers: { Authorization: `Bearer ${CALCOM_API_KEY}` },
      }
    );

    res.json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching slots", error: error.response?.data });
  }
});

// Book an appointment
exports.bookAppointment = asyncWrapper(async (req, res) => {
  try {
    const { professionalId, userEmail, dateTime } = req.body;

    if (!professionalId || !userEmail || !dateTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const response = await axios.post(
      `${CALCOM_API_BASE}/bookings`,
      {
        userEmail,
        professionalId,
        dateTime,
      },
      {
        headers: { Authorization: `Bearer ${CALCOM_API_KEY}` },
      }
    );

    res.status(201).json({
      message: "Appointment booked successfully",
      booking: response.data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error booking appointment",
      error: error.response?.data,
    });
  }
});

// Cancel an appointment
exports.cancelAppointment = asyncWrapper(async (req, res) => {
  try {
    const { bookingId } = req.params;

    const response = await axios.delete(
      `${CALCOM_API_BASE}/bookings/${bookingId}`,
      {
        headers: { Authorization: `Bearer ${CALCOM_API_KEY}` },
      }
    );

    res.json({
      message: "Appointment canceled successfully",
      data: response.data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error canceling appointment",
      error: error.response?.data,
    });
  }
});
