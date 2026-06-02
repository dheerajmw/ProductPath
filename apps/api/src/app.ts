import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { RATE_LIMITS } from "@productpath/shared";
import { logger } from "./lib/logger";
import { createRateLimiter, isRateLimitDisabled } from "./lib/rate-limit";
import { errorHandler } from "./middleware/error-handler";
import { authRoutes } from "./routes/auth.routes";
import { rolesRoutes } from "./routes/roles.routes";
import { healthRoutes } from "./routes/health.routes";
import { privacyRoutes } from "./routes/privacy.routes";
import { adminRoutes } from "./routes/admin.routes";
import { featureFlagsRoutes } from "./routes/feature-flags.routes";
import { candidatesRoutes } from "./routes/candidates.routes";
import { modulesRoutes } from "./routes/modules.routes";
import { adminContentRoutes } from "./routes/admin-content.routes";
import { assessmentsRoutes } from "./routes/assessments.routes";
import { attemptsRoutes } from "./routes/attempts.routes";
import { projectsRoutes } from "./routes/projects.routes";
import { reviewerRoutes } from "./routes/reviewer.routes";
import { publicCandidateRoutes, internalRoutes } from "./routes/verification.routes";
import {
  recruitersRoutes,
  candidateMarketplaceRouter,
  interestRoutes,
} from "./routes/recruiters.routes";
import { communityRoutes } from "./routes/community.routes";
import path from "node:path";

export function createApp() {
  const app = express();

  const corsOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3000,http://localhost:3001")
    .split(",")
    .map((o) => o.trim());

  app.use(helmet());
  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(
    pinoHttp({
      logger,
      autoLogging: process.env.NODE_ENV !== "test",
    }),
  );

  if (isRateLimitDisabled()) {
    logger.info("Rate limiting disabled (RATE_LIMIT_DISABLED)");
  }

  const authLimiter = createRateLimiter({
    ...RATE_LIMITS.auth,
    message: { error: "Too many requests. Try again later." },
    /** Brute-force protection for login/signup — not session reads like GET /auth/me */
    skip: (req) => req.method === "GET",
  });

  const apiLimiter = createRateLimiter({
    ...RATE_LIMITS.api,
    message: { error: "Too many requests. Try again later." },
  });

  app.use("/auth", authLimiter);
  app.use(apiLimiter);

  app.use(healthRoutes);
  app.use("/auth", authRoutes);
  app.use("/roles", rolesRoutes);
  app.use("/privacy", privacyRoutes);
  app.use("/feature-flags", featureFlagsRoutes);
  app.use("/admin", adminRoutes);
  app.use("/admin/content", adminContentRoutes);
  app.use("/candidates", publicCandidateRoutes);
  app.use("/candidates", candidatesRoutes);
  app.use("/candidates", candidateMarketplaceRouter);
  app.use("/recruiters", recruitersRoutes);
  app.use("/interest-requests", interestRoutes);
  app.use("/", communityRoutes);
  app.use("/internal", internalRoutes);
  app.use("/modules", modulesRoutes);
  app.use("/assessments", assessmentsRoutes);
  app.use("/attempts", attemptsRoutes);
  app.use("/projects", projectsRoutes);
  app.use(reviewerRoutes);

  const uploadDir = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
  app.use("/uploads", express.static(uploadDir));

  app.use(errorHandler);

  return app;
}
