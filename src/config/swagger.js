// src/config/swagger.js
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "MedVax API",
        version: "1.0.0",
        description: "Backend API documentation for the MedVax telemedicine platform",
    },
    servers: [
        {
            url: "http://localhost:5000/api", // Update this based on your environment
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ["./src/routes/*.js"], // Paths to your route files
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerSpec, swaggerUi };
