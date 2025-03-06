const Flutterwave = require("flutterwave-node-v3");
require("dotenv").config();

const flw = new Flutterwave(
  process.env.FLUTTERWAVE_SECRET_KEY,
  process.env.FLUTTERWAVE_PUBLIC_KEY
);

exports.createPaymentLink = async (req, res) => {
  try {
    const { amount, email, phone_number, description } = req.body;

    const payload = {
      tx_ref: `medvax-${Date.now()}`, // Unique transaction reference
      amount: amount,
      currency: "NGN", // Currency in Naira
      email: email,
      phone_number: phone_number,
      redirect_url: `${process.env.BASE_URL}/payment-success`,
      order_id: "your_order_id", // Optional if you want to associate with orders
      description: description,
    };

    const response = await flw.PaymentLinks.create(payload);

    if (response.status === "success") {
      return res.json({
        message: "Payment link created",
        link: response.data.link,
      });
    } else {
      return res
        .status(400)
        .json({ message: "Error creating payment link", error: response });
    }
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error processing payment",
        error: error.response?.data,
      });
  }
};

// Handle payment callback
exports.paymentCallback = (req, res) => {
  const { status, tx_ref } = req.query;

  // You can use tx_ref to confirm payment in your database
  if (status === "successful") {
    return res.status(200).json({ message: "Payment successful", tx_ref });
  } else {
    return res.status(400).json({ message: "Payment failed" });
  }
};
