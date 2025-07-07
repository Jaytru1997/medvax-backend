const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    excerpt: {
      type: String,
    },
    banner: {
      type: String,
    },
    category: {
      type: String,
    },
    language: {
      type: String,
      enum: ["en", "fr", "es", "de", "ha", "yo", "ig"], // Example languages
      default: "en",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", BlogSchema);
