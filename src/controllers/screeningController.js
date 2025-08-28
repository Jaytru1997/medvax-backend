const Screening = require("../models/Screening");
const { asyncWrapper } = require("../utils/async");
const { sendEmail } = require("../services/emailService");

//  createScreening,
exports.createScreening = asyncWrapper(async (req, res) => {
  try {
    const {
      screeningRefNo,
      phone_number,
      email,
      name,
      city,
      state,
      tests,
      price,
    } = req.body;
    if (
      !screeningRefNo ||
      !phone_number ||
      !email ||
      !name ||
      !city ||
      !state ||
      !tests ||
      !price
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newScreening = new Screening({
      screeningRefNo,
      phone_number,
      email,
      name,
      city,
      state,
      tests,
      price,
    });
    await newScreening.save();
    return res
      .status(201)
      .json({ message: "Screening created successfully", data: newScreening });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

//   getAllScreenings,
exports.getAllScreenings = asyncWrapper(async (req, res) => {
  try {
    const screenings = await Screening.find();
    return res.status(200).json({ data: screenings });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});
//   getScreeningById,
exports.getScreeningById = asyncWrapper(async (req, res) => {
  try {
    const screening = await Screening.findById(req.params.id);
    if (!screening) {
      return res.status(404).json({ message: "Screening not found" });
    }
    return res.status(200).json({ data: screening });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});
//   updateScreening,
exports.updateScreening = asyncWrapper(async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedScreening = await Screening.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );
    if (!updatedScreening) {
      return res.status(404).json({ message: "Screening not found" });
    }
    await sendEmail({
      email: updatedScreening.email,
      subject: "Your Screening Update",
      header: "Congratulations",
      message_1: `Your screening details have been processed successfully. Find details about your screening date, time and location below`,
      // format date and time from datetime-local string
      // break into separate lines
      message_2: `Date: ${new Date(
        updatedScreening.screening_details.date
      ).toLocaleDateString()}\nTime: ${new Date(
        updatedScreening.screening_details.date
      ).toLocaleTimeString()}\nLocation: ${
        updatedScreening.screening_details.location
      }`,
      message_3: `Thank you for choosing MedVax Health. We wish you a smooth screening process.`,
    });
    return res.status(200).json({
      message: "Screening updated successfully",
      data: updatedScreening,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// add Screening Details to screening e.g location and date for screening
exports.addScreeningDetails = asyncWrapper(async (req, res) => {
  try {
    const { id } = req.params;
    const { location, date } = req.body;
    if (!location || !date) {
      return res
        .status(400)
        .json({ message: "Location and date are required" });
    }
    const updatedScreening = await Screening.findByIdAndUpdate(
      id,
      {
        location,
        date,
      },
      { new: true }
    );
    if (!updatedScreening) {
      return res.status(404).json({ message: "Screening not found" });
    }
    // Send confirmation email
    await sendEmail({
      to: updatedScreening.email,
      subject: "Screening Details Updated",
      text: `Your screening details have been updated. Location: ${location}, Date: ${date}`,
    });
    // Return updated screening details
    return res.status(200).json({
      message: "Screening details updated successfully",
      data: updatedScreening,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

//   deleteScreening,
exports.deleteScreening = asyncWrapper(async (req, res) => {
  try {
    const { id } = req.params;
    const deletedScreening = await Screening.findByIdAndDelete(id);
    if (!deletedScreening) {
      return res.status(404).json({ message: "Screening not found" });
    }
    return res.status(200).json({ message: "Screening deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});
