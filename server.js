const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");
const medicationRoutes = require("./src/routes/medicationRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const crmRoutes = require("./src/routes/crmRoutes");
const chatbotRoutes = require("./src/routes/chatbotRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const blogRoutes = require("./src/routes/blogRoutes");

const logger = require("./src/services/logger");
const { swaggerSpec, swaggerUi } = require("./src/config/swagger");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize app
const app = express();

// make public folder static
app.use(express.static("public"));

// Logging Requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(fileUpload());
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/medications", medicationRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/crm", crmRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/blog", blogRoutes);

// Swagger Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
