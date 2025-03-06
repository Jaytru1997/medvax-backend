// src/config/swagger.js
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "MedVax API",
    version: "1.0.0",
    description:
      "Backend API documentation for the MedVax telemedicine platform",
  },
  servers: [
    {
      url:
        process.env.NODE_ENV === "production"
          ? "https://api.medvaxhealth.com/"
          : "http://localhost:5000/", // Updated based on application environment
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.js"], // Paths to your route files
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerSpec, swaggerUi };
