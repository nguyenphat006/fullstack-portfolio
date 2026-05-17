import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { setupSwagger } from "./docs/swagger";
import { globalErrorHandler, notFoundHandler } from "./middlewares/error.middleware";

dotenv.config();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: ["http://localhost:3000", "https://your-production-url.com"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// Basic health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running perfectly!" });
});

import projectRoutes from "./routes/projects.route";

// Móc nối hệ thống Document Swagger UI
setupSwagger(app);

// Setup routes here (dự kiến mount ở đây)
app.use("/api/projects", projectRoutes);

// Bắt NotFound Error cho các route không tồn tại
app.use(notFoundHandler);

// Móc nối Global Error Handler bắt toàn bộ lỗi tập trung
app.use(globalErrorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});
