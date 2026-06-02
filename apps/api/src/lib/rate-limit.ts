import rateLimit, { type Options } from "express-rate-limit";
import type { RequestHandler } from "express";

/** Set `RATE_LIMIT_DISABLED=true` in local `.env` to turn off all API rate limits. */
export function isRateLimitDisabled(): boolean {
  const flag = process.env.RATE_LIMIT_DISABLED?.toLowerCase();
  return flag === "true" || flag === "1" || flag === "yes";
}

export function createRateLimiter(options: Partial<Options>): RequestHandler {
  if (isRateLimitDisabled()) {
    return (_req, _res, next) => next();
  }
  return rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });
}
