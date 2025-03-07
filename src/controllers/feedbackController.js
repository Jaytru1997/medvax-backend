const Feedback = require("../models/Feedback");

exports.submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const feedback = await Feedback.create({
      userId: req.user.id,
      rating,
      comment,
    });

    res
      .status(201)
      .json({ message: "Feedback submitted successfully", data: feedback });
  } catch (error) {
    res.status(500).json({ message: "Error submitting feedback", error });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const feedbackList = await Feedback.find().populate("userId", "name email");
    res.status(200).json({ data: feedbackList });
  } catch (error) {
    res.status(500).json({ message: "Error fetching feedback", error });
  }
};

exports.getFeedbackAnalytics = async (req, res) => {
  try {
    const analytics = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    res
      .status(200)
      .json({ data: analytics[0] || { averageRating: 0, count: 0 } });
  } catch (error) {
    res.status(500).json({ message: "Error fetching analytics", error });
  }
};
