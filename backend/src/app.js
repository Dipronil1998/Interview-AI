import express from "express";
import cors from "cors";

import chatRoutes from "./routes/chat.routes.js";
import voiceRoutes from "./routes/voice.routes.js";
import { setupSwagger } from "./config/swagger.js";

const app = express();

app.use(cors());

app.use(express.json());

// Initialize Swagger UI Documentation
setupSwagger(app);

app.use("/api", chatRoutes);
app.use("/api/voice", voiceRoutes);

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "AI Multi-Agent API is running",
    swaggerDocs: "/api-docs"
  });
});

export default app;