const express = require("express");
const { createPaymentLink, paymentCallback } = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Endpoint to create a payment link
router.post("/create-link", authMiddleware, createPaymentLink);

// Flutterwave callback (for webhook)
router.get("/callback", paymentCallback);

module.exports = router;
