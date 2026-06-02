import { prisma, PlatformRole } from "@productpath/database";
import bcrypt from "bcryptjs";
import { AuthError, toPublicUser } from "./auth.service.js";
import { generateToken, addHours } from "../lib/tokens.js";
import { EMAIL_VERIFY_HOURS } from "@productpath/shared";
import { sendVerificationEmail } from "../lib/email.js";
import { writeAudit } from "../lib/audit.js";

const WEB_APP_URL = process.env.WEB_APP_URL ?? "http://localhost:3000";

export class RecruiterError extends Error {
  constructor(
    message: string,
    public statusCode = 400,
    public code?: string,
  ) {
    super(message);
    this.name = "RecruiterError";
  }
}

export async function recruiterSignup(
  input: { email: string; password: string; company: string; companyDomain?: string },
  ipAddress?: string,
) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AuthError("An account with this email already exists", 409, "EMAIL_EXISTS");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const emailDomain = input.email.split("@")[1]?.toLowerCase();
  const autoVerify =
    input.companyDomain &&
    emailDomain &&
    input.companyDomain.toLowerCase().replace(/^@/, "") === emailDomain;

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      platformRole: PlatformRole.RECRUITER,
      recruiterProfile: {
        create: {
          company: input.company,
          companyDomain: input.companyDomain ?? null,
          verified: Boolean(autoVerify),
        },
      },
    },
    include: { recruiterProfile: true },
  });

  const token = generateToken();
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: addHours(new Date(), EMAIL_VERIFY_HOURS),
    },
  });

  const verifyUrl = `${WEB_APP_URL}/verify-email?token=${token}`;
  await sendVerificationEmail(user.email, verifyUrl);

  await writeAudit({
    userId: user.id,
    action: "recruiter.signup",
    entity: "User",
    entityId: user.id,
    ipAddress,
    metadata: { company: input.company, autoVerify },
  });

  return {
    user: toPublicUser(user),
    recruiterProfile: user.recruiterProfile,
    verificationPending: !user.recruiterProfile?.verified,
  };
}

export async function getRecruiterMe(userId: string) {
  const profile = await prisma.recruiterProfile.findUnique({
    where: { userId },
    include: { user: { select: { email: true, emailVerifiedAt: true } } },
  });
  if (!profile) {
    throw new RecruiterError("Recruiter profile not found", 404);
  }
  return {
    company: profile.company,
    companyDomain: profile.companyDomain,
    verified: profile.verified,
    email: profile.user.email,
    emailVerified: Boolean(profile.user.emailVerifiedAt),
  };
}

export async function verifyRecruiter(userId: string, adminId: string) {
  const profile = await prisma.recruiterProfile.update({
    where: { userId },
    data: { verified: true },
  });
  await writeAudit({
    userId: adminId,
    action: "recruiter.verified",
    entity: "RecruiterProfile",
    entityId: profile.id,
    metadata: { recruiterUserId: userId },
  });
  return { verified: true };
}

export async function listRecruitersPending() {
  const recruiters = await prisma.recruiterProfile.findMany({
    where: { verified: false },
    include: {
      user: { select: { id: true, email: true, createdAt: true, emailVerifiedAt: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  return { recruiters };
}

export async function assertRecruiterVerified(userId: string) {
  const profile = await prisma.recruiterProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new RecruiterError("Recruiter profile required", 403, "NOT_RECRUITER");
  }
  if (!profile.verified) {
    throw new RecruiterError("Recruiter verification required", 403, "RECRUITER_NOT_VERIFIED");
  }
}
