const { v4: uuidv4, validate: uuidValidate } = require("uuid");

/**
 * Validate UUID format
 * @param {string} uuid - UUID to validate
 * @returns {boolean} - True if valid UUID format
 */
const isValidUUID = (uuid) => {
  if (!uuid || typeof uuid !== "string") {
    return false;
  }

  // Check if it's a standard UUID v4
  if (uuidValidate(uuid)) {
    return true;
  }

  // Check if it's our custom format (uuid_timestamp_random)
  const customUUIDPattern = /^uuid_\d+_[a-zA-Z0-9]{9}$/;
  return customUUIDPattern.test(uuid);
};

/**
 * Generate a valid UUID for anonymous users
 * @returns {string} - Generated UUID
 */
const generateAnonymousUUID = () => {
  return `uuid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate and sanitize user input
 * @param {string} message - User message to validate
 * @returns {Object} - Validation result
 */
const validateUserMessage = (message) => {
  const result = {
    isValid: true,
    sanitizedMessage: message,
    errors: [],
  };

  if (!message || typeof message !== "string") {
    result.isValid = false;
    result.errors.push("Message must be a non-empty string");
    return result;
  }

  // Check message length
  if (message.length > 1000) {
    result.isValid = false;
    result.errors.push("Message too long (max 1000 characters)");
    return result;
  }

  // Check for potentially malicious content
  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(message)) {
      result.isValid = false;
      result.errors.push("Message contains potentially malicious content");
      break;
    }
  }

  // Basic sanitization (remove HTML tags)
  result.sanitizedMessage = message.replace(/<[^>]*>/g, "");

  return result;
};

/**
 * Validate context data
 * @param {Object} contextData - Context data to validate
 * @returns {Object} - Validation result
 */
const validateContextData = (contextData) => {
  const result = {
    isValid: true,
    sanitizedContext: {},
    errors: [],
  };

  if (!contextData || typeof contextData !== "object") {
    return result;
  }

  // Limit context data size
  const contextString = JSON.stringify(contextData);
  if (contextString.length > 5000) {
    result.isValid = false;
    result.errors.push("Context data too large (max 5KB)");
    return result;
  }

  // Sanitize context data
  for (const [key, value] of Object.entries(contextData)) {
    if (typeof key === "string" && key.length <= 50) {
      if (typeof value === "string" && value.length <= 500) {
        result.sanitizedContext[key] = value;
      } else if (typeof value === "number" || typeof value === "boolean") {
        result.sanitizedContext[key] = value;
      }
    }
  }

  return result;
};

/**
 * Validate session ID format
 * @param {string} sessionId - Session ID to validate
 * @returns {boolean} - True if valid session ID format
 */
const isValidSessionId = (sessionId) => {
  if (!sessionId || typeof sessionId !== "string") {
    return false;
  }

  // Check if it's a valid UUID
  return uuidValidate(sessionId);
};

/**
 * Get client IP address
 * @param {Object} req - Express request object
 * @returns {string} - Client IP address
 */
const getClientIP = (req) => {
  return (
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip ||
    "unknown"
  );
};

/**
 * Get user agent
 * @param {Object} req - Express request object
 * @returns {string} - User agent string
 */
const getUserAgent = (req) => {
  return req.headers["user-agent"] || "unknown";
};

/**
 * Check if request is from a suspicious source
 * @param {Object} req - Express request object
 * @returns {Object} - Security check result
 */
const performSecurityCheck = (req) => {
  const result = {
    isSuspicious: false,
    reasons: [],
  };

  const userAgent = getUserAgent(req);
  const ip = getClientIP(req);

  // Check for missing or suspicious user agent
  if (!userAgent || userAgent === "unknown") {
    result.isSuspicious = true;
    result.reasons.push("Missing user agent");
  }

  // Check for common bot user agents
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /perl/i,
  ];

  for (const pattern of botPatterns) {
    if (pattern.test(userAgent)) {
      result.isSuspicious = true;
      result.reasons.push("Bot-like user agent detected");
      break;
    }
  }

  // Check for suspicious IP patterns (basic check)
  if (ip === "unknown" || ip === "127.0.0.1") {
    result.isSuspicious = true;
    result.reasons.push("Suspicious IP address");
  }

  return result;
};

module.exports = {
  isValidUUID,
  generateAnonymousUUID,
  validateUserMessage,
  validateContextData,
  isValidSessionId,
  getClientIP,
  getUserAgent,
  performSecurityCheck,
};
