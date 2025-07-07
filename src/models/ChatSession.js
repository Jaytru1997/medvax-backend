const mongoose = require("mongoose");

const ChatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true, // For faster queries
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    contextData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    lastActivity: {
      type: Date,
      default: Date.now,
      index: true, // For cleanup queries
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    userAgent: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: function () {
        // Sessions expire after 24 hours of inactivity
        return new Date(Date.now() + 24 * 60 * 60 * 1000);
      },
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
ChatSessionSchema.index({ userId: 1, isActive: 1 });
ChatSessionSchema.index({ expiresAt: 1, isActive: 1 });

// Method to update last activity
ChatSessionSchema.methods.updateActivity = function () {
  this.lastActivity = new Date();
  this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Extend expiry
  this.messageCount += 1;
  return this.save();
};

// Method to deactivate session
ChatSessionSchema.methods.deactivate = function () {
  this.isActive = false;
  return this.save();
};

// Static method to cleanup expired sessions
ChatSessionSchema.statics.cleanupExpiredSessions = async function () {
  const result = await this.updateMany(
    {
      expiresAt: { $lt: new Date() },
      isActive: true,
    },
    {
      isActive: false,
    }
  );
  return result.modifiedCount;
};

// Static method to get active session count
ChatSessionSchema.statics.getActiveSessionCount = async function () {
  return await this.countDocuments({ isActive: true });
};

// Static method to get sessions by user
ChatSessionSchema.statics.getUserSessions = async function (userId) {
  return await this.find({ userId, isActive: true }).sort({ lastActivity: -1 });
};

module.exports = mongoose.model("ChatSession", ChatSessionSchema);
