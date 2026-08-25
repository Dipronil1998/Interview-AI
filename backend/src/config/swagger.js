import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Multi-Agent Developer Assistant API",
      version: "1.0.0",
      description: "API documentation for Multi-Agent Developer Assistant featuring Orchestrator, Code, Debug, Database, and Documentation agents.",
    },
    servers: [
      {
        url: "/",
        description: "Current Host Server",
      },
    ],
  },
  apis: ["./src/docs/*.js", "./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
