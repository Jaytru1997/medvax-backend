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
  components: {
    schemas: {
      TeamMember: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            description: "Team member ID",
          },
          name: {
            type: "string",
            description: "Team member name",
            maxLength: 100,
          },
          title: {
            type: "string",
            description: "Team member title",
            maxLength: 100,
          },
          image: {
            type: "string",
            description: "Image URL",
          },
          department: {
            type: "string",
            description: "Department name",
            maxLength: 100,
          },
          bio: {
            type: "string",
            description: "Team member bio",
            maxLength: 500,
          },
          email: {
            type: "string",
            format: "email",
            description: "Email address",
          },
          linkedin: {
            type: "string",
            description: "LinkedIn profile URL",
          },
          twitter: {
            type: "string",
            description: "Twitter profile URL",
          },
          order: {
            type: "number",
            description: "Display order",
          },
          isActive: {
            type: "boolean",
            description: "Active status",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Creation timestamp",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Last update timestamp",
          },
        },
        required: ["name", "title", "image", "department"],
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.js"], // Paths to your route files
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerSpec, swaggerUi };
