import { Router } from "express";
import {
  changeEmailSchema,
  loginSchema,
  signupSchema,
  verifyEmailSchema,
  SESSION_COOKIE,
} from "@productpath/shared";
import { setSessionCookie, clearSessionCookie } from "../lib/session-cookie";
import { z } from "zod";
import {
  login,
  logout,
  resendVerification,
  signup,
  verifyEmail,
  AuthError,
} from "../services/auth.service";
import { changeEmail } from "../services/user.service";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { shouldExposeDevVerifyUrl } from "../lib/email";

const router = Router();

function withDevVerifyUrl<T extends { verifyUrl?: string }>(payload: T) {
  const { verifyUrl, ...rest } = payload;
  if (shouldExposeDevVerifyUrl() && verifyUrl) {
    return { ...rest, devVerifyUrl: verifyUrl };
  }
  return rest;
}

router.post("/signup", async (req, res, next) => {
  try {
    const input = signupSchema.parse(req.body);
    const result = await signup(input, req.ip);
    res.status(201).json(withDevVerifyUrl(result));
  } catch (e) {
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const result = await login(input, req.ip);
    setSessionCookie(res, result.sessionToken);
    res.json({ user: result.user });
  } catch (e) {
    next(e);
  }
});

router.post("/logout", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const token = req.cookies?.[SESSION_COOKIE] as string;
    await logout(token, req.user?.id);
    clearSessionCookie(res);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

router.post("/verify-email", async (req, res, next) => {
  try {
    const { token } = verifyEmailSchema.parse(req.body);
    const result = await verifyEmail(token);
    setSessionCookie(res, result.sessionToken);
    res.json({ user: result.user });
  } catch (e) {
    next(e);
  }
});

router.post("/resend-verification", async (req, res, next) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const result = await resendVerification(email);
    res.json(withDevVerifyUrl(result));
  } catch (e) {
    next(e);
  }
});

router.get("/me", requireAuth, (req: AuthedRequest, res) => {
  const u = req.user!;
  res.json({
    user: {
      id: u.id,
      email: u.email,
      platformRole: u.platformRole,
      emailVerified: Boolean(u.emailVerifiedAt),
      createdAt: u.createdAt.toISOString(),
      candidateProfile: u.candidateProfile,
      recruiterProfile: u.recruiterProfile,
    },
  });
});

router.post("/change-email", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const input = changeEmailSchema.parse(req.body);
    const result = await changeEmail(req.user!.id, input, req.ip);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export { router as authRoutes, AuthError };
