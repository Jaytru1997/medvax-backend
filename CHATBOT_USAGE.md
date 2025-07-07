# MedVax Chatbot - Multi-Session Usage Guide

## Overview

The MedVax chatbot is production-ready, supporting multiple concurrent chat sessions with robust security, validation, and monitoring. Each user gets a unique session, and the backend enforces strict validation, rate limiting, and session cleanup. The frontend must provide a unique identifier (UUID) for each user.

## Key Features

- **Database Session Management**: All sessions are stored in MongoDB for reliability and scalability.
- **Automatic Session Cleanup**: Inactive sessions are cleaned up automatically in the background.
- **Rate Limiting**: Prevents abuse by limiting requests per user and per IP.
- **UUID Validation**: All user IDs are validated for correct format.
- **Comprehensive Logging & Monitoring**: All events, errors, and suspicious activity are logged.
- **Security for Anonymous Users**: Input is sanitized, context is size-limited, and suspicious requests are logged.
- **Admin Monitoring**: Endpoints for health checks and session statistics.

## Frontend UUID Generation

The frontend must generate and persist a unique identifier for each user. This UUID should:

- Be generated on first visit
- Be stored in localStorage or sessionStorage
- Be sent with every chat request
- Remain consistent for the user's session

```javascript
function generateUserId() {
  let userId = localStorage.getItem('chatbot_user_id');
  if (!userId) {
    userId = 'uuid_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('chatbot_user_id', userId);
  }
  return userId;
}
```

## API Endpoints

### 1. Start a Conversation

**POST** `/api/chatbot/start-conversation`

```json
{
  "userId": "uuid_1234567890_abc123def" // Required - frontend-generated UUID
}
```

**Response:**

```json
{
  "message": "Conversation started successfully",
  "userId": "uuid_1234567890_abc123def",
  "sessionId": "session-uuid-here",
  "isActive": true
}
```

### 2. Chat with Bot

**POST** `/api/chatbot/chat`

```json
{
  "message": "Hello, I need help with my medication",
  "userId": "uuid_1234567890_abc123def",
  "sessionId": "session-uuid-here",
  "contextData": { "userType": "patient" }
}
```

**Response:**

```json
{
  "text": "Hello! I can help you with your medication questions.",
  "intent": "medication_help",
  "confidence": 0.95,
  "sessionId": "session-uuid-here",
  "context": { "userType": "patient" },
  "parameters": {},
  "action": "medication_assistance",
  "allRequiredParamsPresent": true,
  "userId": "uuid_1234567890_abc123def",
  "language": "en"
}
```

### 3. Get Session Information

**GET** `/api/chatbot/session/{userId}`

**Response:**

```json
{
  "userId": "uuid_1234567890_abc123def",
  "sessionId": "session-uuid-here",
  "isActive": true,
  "messageCount": 5,
  "lastActivity": "2024-07-08T12:34:56.789Z"
}
```

### 4. Admin: Get Session Statistics

**GET** `/api/chatbot/admin/statistics`

**Response:**

```json
{
  "success": true,
  "data": {
    "totalSessions": 100,
    "activeSessions": 20,
    "expiredSessions": 80,
    "avgMessagesPerSession": 7.2,
    "totalMessages": 720,
    "cleanupNeeded": false
  }
}
```

### 5. Health Check

**GET** `/api/chatbot/health`

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-07-08T12:34:56.789Z",
  "activeSessions": 20,
  "totalSessions": 100,
  "uptime": 12345.67
}
```

## Rate Limiting & Security

- **Chat messages**: 10 per minute per user
- **Session creation**: 5 per hour per user
- **Abuse**: Exceeding limits returns HTTP 429 with a retry time
- **UUIDs**: Must match the required format (see below)
- **Input**: All messages and context are validated and sanitized
- **Suspicious activity**: Bot user agents, localhost IPs, and other patterns are logged

## Error Handling

All errors return a JSON object with an `error` message and a `code`.

**Examples:**

```json
// Missing userId
{"error": "User ID is required. Please provide a unique identifier from the frontend.", "code": "MISSING_USER_ID"}

// Invalid UUID
{"error": "Invalid user ID format. Please provide a valid UUID.", "code": "INVALID_USER_ID"}

// Rate limit exceeded
{"error": "Rate limit exceeded", "message": "Too many requests. Please try again later.", "retryAfter": 60}

// Internal error
{"error": "Error processing chatbot request. Please try again later.", "code": "INTERNAL_ERROR"}
```

## UUID Format

- Standard UUID v4 or custom: `uuid_<timestamp>_<random>`
- Example: `uuid_1720456789012_abc123def`
- Invalid UUIDs are rejected with a 400 error

## Frontend Usage Example

```javascript
const userId = generateUserId();

// Start conversation
await fetch('/api/chatbot/start-conversation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId })
});

// Send a message
await fetch('/api/chatbot/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Hello!",
    userId,
    sessionId,
    contextData: { foo: 'bar' }
  })
});
```

## Best Practices

- Always provide a valid UUID as `userId`
- Store the UUID in localStorage for persistence
- Handle error codes and retry after rate limits
- Monitor admin endpoints for health and statistics
- Never send sensitive data in context or messages

## Monitoring & Maintenance

- **Automatic cleanup**: No manual intervention needed for expired sessions
- **Admin endpoints**: Use `/api/chatbot/admin/statistics` and `/api/chatbot/health` for monitoring
- **Logs**: All suspicious and error events are logged for review

## Security Notes

- All user input is validated and sanitized
- Context data is size-limited and checked for malicious content
- Rate limiting and security checks are enforced for all users, including anonymous
- Admin endpoints should be protected (e.g., with authentication middleware)
