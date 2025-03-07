# MedVax Backend

## Overview

The MedVax backend is a Node.js (Express) and MongoDB-based API supporting a telemedicine service. This backend provides functionalities for user authentication, medication management, teleconsultation booking, CRM integration, chatbot support, notifications, and payment processing.

## Features

- **User Authentication**: Secure user registration and login with JWT-based session management.
- **Medication Catalog**: API endpoints for adding, updating, retrieving, and deleting medications (admin-controlled).
- **Teleconsultation Booking**: Integration with Cal.com for scheduling virtual doctor consultations.
- **Payment Processing**: Integration with Flutterwave for handling transactions securely.
- **User Dashboard**: Allows users to track medication history and schedule refills.
- **CRM System Integration**:
  - Retrieve user data and interaction history.
  - Log user interactions, feedback, and inquiries.
  - Automated notifications via Twilio (SMS/WhatsApp) and Nodemailer (email).
- **AI-Powered Chatbot Support**:
  - Integrates Dialogflow for chatbot interactions.
  - Supports dynamic training for new intents and multilingual support.
- **User Notification System**:
  - Fetch notifications.
  - Generate and send notifications for appointments, new medications, and updates.
- **Security & Privacy**:
  - Implements role-based access control (RBAC).
  - Ensures encryption and compliance with health data laws.
- **Performance Optimization**:
  - Database indexing for frequently queried fields.
  - No Redis caching (as per project constraints).
- **Job Schedule**:
  - Automate reminders and special mailing lists with job schedule.
- **Feedback Loop**:
  - Users can submit feedback.
  - Admins can retrieve feedback for evaluation.
- **Error Handling**:
  - Standardized error responses with logging (Winston/Morgan).
- **Scalability Considerations**:
  - Documented steps for microservices deployment and load balancing.

## Tech Stack

- **Backend**: Node.js (Express)
- **Database**: MongoDB (Mongoose ORM)
- **Authentication**: JWT
- **Payments**: Flutterwave
- **Chatbot**: Dialogflow
- **Messaging**: Twilio (SMS/WhatsApp), Nodemailer (Email)
- **API Documentation**: Swagger
- **Error Logging**: Winston/Morgan
- **Job Scheduling**: [Node-Cron-JS](https://www.npmjs.com/package/node-cron-js)

## Installation & Setup

### Prerequisites

Ensure you have the following installed:

- Node.js (v16+)
- MongoDB (local or cloud-based, e.g., MongoDB Atlas)
- A Google Cloud account (for Dialogflow and Translation API)
- Flutterwave API keys
- Twilio API keys

### Clone the Repository

```sh
git clone https://github.com/your-repo/medvax-backend.git
cd medvax-backend
```

### Install Dependencies

```sh
npm install
```

### Environment Variables

Create a `.env` file in the root directory and add the following:

```env
NODE_ENV=production
APP_NAME=App_Name
URL=your-site.com
PORT=5000
MONGO_URI=mongodb+srv://your_mongodb_connection_string

MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USERNAME=your_username
MAILTRAP_PASSWORD=your_password

MAIL_HOST=your_host
MAIL_PORT=587/465
MAIL_ADDR=your_email
MAIL_SECRET=your_password
MAIL_DISPLAYNAME=Display_Name

CALCOM_API_KEY=your_calcom_api_key

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=30d

DIALOGFLOW_PROJECT_ID=your_project_id
DIALOGFLOW_KEY_PATH=./src/config/medvax-dialogflow-key.json

FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
FLUTTERWAVE_ENCRYPTION_KEY=your_flutterwave_encryption_key

TWILIO_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE=+12345678901
ADMIN_EMAIL=admin@your-site.com
```

### Start the Server

```sh
npm start
```

The server should now be running on `http://localhost:5000`

## API Endpoints

### **User Authentication**

| Method | Endpoint          | Description       |
|--------|------------------|-------------------|
| POST   | /api/auth/register | Register a user |
| POST   | /api/auth/login    | User login |

### **Medication Management**

| Method | Endpoint          | Description       |
|--------|------------------|-------------------|
| GET    | /api/medications | Retrieve all medications |
| POST   | /api/medications | Add a new medication (Admin) |

### **Chatbot**

| Method | Endpoint | Description |
|--------|---------|-------------|
| POST   | /api/chatbot/chat | Process chatbot messages |
| POST   | /api/admin/train-chatbot | Train chatbot dynamically |

### **Payment Processing**

| Method | Endpoint | Description |
|--------|---------|-------------|
| POST   | /api/payments/initiate | Initialize payment |
| GET    | /api/payments/status/:id | Check payment status |

More API endpoints are available in the Swagger documentation.

## Deployment

To deploy on **Render**:

1. Push your code to GitHub.
2. Create a new service in Render.
3. Set up environment variables as in `.env`.
4. Deploy and access the backend via the provided URL.

## Testing

Run tests with:

```sh
npm test
```

## Contributions

Contributions are closed to the public! Only active company staff/development team are authorised to fork the repo, make changes, and submit a pull request.

## License

This project is licensed under the [Lesous Technology LTD](https://lesous.ng) Software Production License.
