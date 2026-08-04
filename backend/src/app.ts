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

// CORS — exposedHeaders is required because browsers hide all response headers
// from JS by default except a small safelist; Content-Disposition (used to send
// the real Nepali filename for generated documents) is NOT in that safelist,
// so without this the frontend can never read it, no matter how it's parsed.
app.use(cors({ origin: env.cors.origin, credentials: true, exposedHeaders: ["Content-Disposition"] }));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Profile photos are served as plain static files so <img src="..."> works
// directly — unlike case documents (which stay behind authenticated download
// endpoints), avatars are low-sensitivity and need to load cross-origin from
// the web apps (different port than the API), which helmet's default
// Cross-Origin-Resource-Policy would otherwise block.
app.use(
  "/uploads/avatars",
  express.static(require("path").join(process.cwd(), env.storage.localUploadDir, "avatars"), {
    setHeaders: (res) => res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"),
  })
);

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
