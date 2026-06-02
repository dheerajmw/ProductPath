import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AuthError } from "../services/auth.service";
import { LearningError } from "../services/learning.service";
import { AssessmentError } from "../services/assessment.service";
import { RecommendationError } from "../services/recommendation.service";
import { ProjectError } from "../services/project.service";
import { ReviewError } from "../services/review.service";
import { StorageError } from "../lib/storage";
import { VerificationError } from "../services/verification.service.js";
import { MarketplaceError } from "../services/marketplace.service.js";
import { RecruiterError } from "../services/recruiter.service.js";
import { InterestError } from "../services/interest.service.js";
import { CommunityError } from "../services/community.service.js";
import { ModerationError } from "../services/moderation.service.js";
import { logger } from "../lib/logger";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (
    err instanceof AuthError ||
    err instanceof LearningError ||
    err instanceof AssessmentError ||
    err instanceof RecommendationError ||
    err instanceof ProjectError ||
    err instanceof ReviewError ||
    err instanceof StorageError ||
    err instanceof VerificationError ||
    err instanceof MarketplaceError ||
    err instanceof RecruiterError ||
    err instanceof InterestError ||
    err instanceof CommunityError ||
    err instanceof ModerationError
  ) {
    return res.status(err.statusCode).json({ error: err.message, code: err.code });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      details: err.flatten().fieldErrors,
    });
  }

  logger.error({ err }, "Unhandled error");
  return res.status(500).json({ error: "Internal server error" });
}
