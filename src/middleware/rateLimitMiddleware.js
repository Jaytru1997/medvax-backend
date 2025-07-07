const rateLimit = require("express-rate-limit");
const ChatSession = require("../models/ChatSession");

// Rate limiter for chatbot endpoints
const chatbotRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: async (req) => {
    // Different limits based on endpoint
    const endpoint = req.path;

    if (endpoint === "/api/chatbot/chat") {
      return 50; // 50 messages per 15 minutes
    } else if (endpoint === "/api/chatbot/start-conversation") {
      return 10; // 10 conversation starts per 15 minutes
    } else {
      return 100; // Default limit
    }
  },
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use userId if available, otherwise use IP
    return req.body?.userId || req.ip;
  },
  skip: (req) => {
    // Skip rate limiting for admin endpoints
    return req.path.includes("/admin");
  },
  handler: (req, res) => {
    res.status(429).json({
      error: "Rate limit exceeded",
      message: "Too many requests. Please try again later.",
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});

// Specific rate limiter for chat messages
const chatMessageRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 messages per minute
  message: {
    error: "Too many messages sent, please slow down.",
    retryAfter: "1 minute",
  },
  keyGenerator: (req) => {
    return req.body?.userId || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: "Message rate limit exceeded",
      message: "You are sending messages too quickly. Please wait a moment.",
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});

// Rate limiter for session creation
const sessionCreationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 new sessions per hour per user
  message: {
    error: "Too many session creation attempts.",
    retryAfter: "1 hour",
  },
  keyGenerator: (req) => {
    return req.body?.userId || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: "Session creation rate limit exceeded",
      message: "Too many session creation attempts. Please try again later.",
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});

module.exports = {
  chatbotRateLimiter,
  chatMessageRateLimiter,
  sessionCreationRateLimiter,
};
