const Notification = require("../models/Notification");

exports.createNotification = async (req, res) => {
  try {
    const { userId, message, type } = req.body;
    const notification = await Notification.create({ userId, message, type });

    res
      .status(201)
      .json({ message: "Notification created", data: notification });
  } catch (error) {
    res.status(500).json({ message: "Error creating notification", error });
  }
};

exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id });
    res.status(200).json({ data: notifications });
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error });
  }
};
