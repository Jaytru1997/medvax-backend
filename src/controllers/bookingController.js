const axios = require("axios");
require("dotenv").config();
const { asyncWrapper } = require("../utils/async");

const CALCOM_API_BASE = process.env.CALCOM_API_BASE;
const CALCOM_API_KEY = process.env.CALCOM_API_KEY;
const CALCOM_USERNAME = process.env.CALCOM_USERNAME || "oghenekparobo";

function getYearDateRange() {
  const today = new Date();
  const pad = (n) => n.toString().padStart(2, "0");
  const startDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(
    today.getDate()
  )}`;

  const endOfYear = new Date(today.getFullYear(), 11, 31);
  const endDate = `${endOfYear.getFullYear()}-${pad(
    endOfYear.getMonth() + 1
  )}-${pad(endOfYear.getDate())}`;

  return { startDate, endDate };
}

// Get available appointment slots
exports.getAvailableSlots = asyncWrapper(async (req, res) => {
  try {
    const username = CALCOM_USERNAME;
    const dateRange = getYearDateRange();
    const startDate = dateRange.startDate;
    const endDate = dateRange.endDate;

    const eventTypeSlug = req.params.event_type;

    // console.log(CALCOM_API_BASE, CALCOM_API_KEY, CALCOM_USERNAME);

    if (!username) {
      return res.status(400).json({ message: "Professional ID is required" });
    }

    const response = await axios.get(
      `${CALCOM_API_BASE}/slots?eventTypeSlug=1v1-session&username=${username}&start=${startDate}&end=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${CALCOM_API_KEY}`,
          "cal-api-version": "2024-09-04",
        },
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
        headers: {
          Authorization: `Bearer ${CALCOM_API_KEY}`,
          "cal-api-version": "2024-09-04",
        },
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
        headers: {
          Authorization: `Bearer ${CALCOM_API_KEY}`,
          "cal-api-version": "2024-09-04",
        },
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
