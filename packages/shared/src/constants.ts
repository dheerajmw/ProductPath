export const SESSION_COOKIE = "pp_session";
export const SESSION_DAYS = 14;

export const EMAIL_VERIFY_HOURS = 24;
export const PASSWORD_RESET_HOURS = 1;

export const RATE_LIMITS = {
  auth: { windowMs: 15 * 60 * 1000, max: 20 },
  api: { windowMs: 60 * 1000, max: 120 },
  interest: { windowMs: 60 * 60 * 1000, max: 20 },
  post: { windowMs: 60 * 60 * 1000, max: 30 },
  like: { windowMs: 60 * 1000, max: 60 },
} as const;

export const COMMUNITY_MAX_COMMENT_DEPTH = 2;

export const INTEREST_PENDING_DAYS = 30;

export const FIELD_LIMITS = {
  email: 255,
  password: 128,
  displayName: 100,
  bio: 2000,
  postBody: 5000,
  commentBody: 2000,
  reportReason: 1000,
} as const;
