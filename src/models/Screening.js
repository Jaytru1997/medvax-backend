const mongoose = require("mongoose");

const ScreeningSchema = new mongoose.Schema({
  screeningRefNo: String,
  phone_number: String,
  email: String,
  name: String,
  city: String,
  state: String,
  screening_details: {
    location: String,
    date: String,
  },
  tests: [],
  price: Number,
  isApproved: { type: Boolean, default: false },
});

module.exports = mongoose.model("Screening", ScreeningSchema);
