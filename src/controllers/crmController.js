const CRMLog = require("../models/CRMLog");
const twilio = require("twilio");
// const sgMail = require("@sendgrid/mail");
const User = require("../models/User");
const { sendEmail } = require("../services/emailService");
const { asyncWrapper } = require("../utils/async");

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.logInteraction = asyncWrapper(async (req, res) => {
  try {
    const { userId, type, message } = req.body;
    const log = await CRMLog.create({ userId, type, message });

    // Send Notification
    const user = await User.findById(userId);
    if (user) {
      await sendNotification(user.phone, message);
    }

    res.status(201).json({ message: "CRM Log saved", data: log });
  } catch (error) {
    res.status(500).json({ message: "Error logging interaction", error });
  }
});

async function sendNotification(phone, message) {
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE,
    to: phone,
  });

  const emailOptions = {
    email: process.env.ADMIN_EMAIL,
    subject: "New CRM Interaction",
    header: "New CRM Interaction",
    message,
  };
  await sendEmail(emailOptions);
}
