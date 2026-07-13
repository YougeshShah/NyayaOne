import "express-async-errors"; // must be imported before routes are registered
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { env } from "./config/env";
import apiRoutes from "./routes";
import { errorHandler } from "./common/middleware/errorHandler";

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({ origin: env.cors.origin, credentials: true }));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

// Rate limiting (applies to all API routes)
app.use(
  `/api/${env.apiVersion}`,
  rateLimit({
    windowMs: env.rateLimit.windowMs,
    max: env.rateLimit.maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Versioned API routes
app.use(`/api/${env.apiVersion}`, apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
