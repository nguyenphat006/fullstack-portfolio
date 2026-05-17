import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ERICSS Portfolio REST API",
      version: "1.0.0",
      description: "Hệ thống API Documentation chuẩn hoá cho Portfolio của Nguyễn Đăng Phát (ERICSS)",
      contact: {
        name: "Nguyễn Đăng Phát",
        url: "https://dangphat.dev",
      },
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Development server",
      },
      {
        url: "https://your-production-url.com",
        description: "Production server",
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // Quét các file router để tự generate docs
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📄 Swagger Docs available at http://localhost:4000/api/docs");
};
