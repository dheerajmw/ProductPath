import { prisma, PlatformRole } from "@productpath/database";
import {
  EMAIL_VERIFY_HOURS,
  SESSION_DAYS,
  normalizeEmail,
  type LoginInput,
  type SignupInput,
} from "@productpath/shared";
import bcrypt from "bcryptjs";
import { generateToken, addDays, addHours } from "../lib/tokens";
import { sendVerificationEmail } from "../lib/email";
import { writeAudit } from "../lib/audit";

const WEB_APP_URL = process.env.WEB_APP_URL ?? "http://localhost:3000";

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode = 400,
    public code?: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export function toPublicUser(user: {
  id: string;
  email: string;
  platformRole: PlatformRole;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  candidateProfile?: {
    displayName: string | null;
    activeRoleId: string | null;
    activeRole?: { id: string; slug: string; name: string; description: string | null } | null;
  } | null;
  recruiterProfile?: {
    company: string | null;
    companyDomain: string | null;
    verified: boolean;
  } | null;
}) {
  return {
    id: user.id,
    email: user.email,
    platformRole: user.platformRole,
    emailVerified: Boolean(user.emailVerifiedAt),
    createdAt: user.createdAt.toISOString(),
    candidateProfile: user.candidateProfile
      ? {
          displayName: user.candidateProfile.displayName,
          activeRoleId: user.candidateProfile.activeRoleId,
          activeRole: user.candidateProfile.activeRole ?? null,
        }
      : null,
    recruiterProfile: user.recruiterProfile
      ? {
          company: user.recruiterProfile.company,
          companyDomain: user.recruiterProfile.companyDomain,
          verified: user.recruiterProfile.verified,
        }
      : null,
  };
}

async function findUserByEmail(email: string) {
  const normalized = normalizeEmail(email);
  const exact = await prisma.user.findUnique({ where: { email: normalized } });
  if (exact) return exact;

  return prisma.user.findFirst({
    where: { email: { equals: normalized, mode: "insensitive" } },
  });
}

export async function signup(input: SignupInput, ipAddress?: string) {
  const email = normalizeEmail(input.email);
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new AuthError("An account with this email already exists", 409, "EMAIL_EXISTS");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      platformRole: PlatformRole.CANDIDATE,
      candidateProfile: {
        create: {
          displayName: input.displayName ?? input.email.split("@")[0],
        },
      },
    },
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
    action: "auth.signup",
    entity: "User",
    entityId: user.id,
    ipAddress,
  });

  return {
    user: toPublicUser(user),
    message: "Check your email to verify your account.",
    verifyUrl,
  };
}

export async function login(input: LoginInput, ipAddress?: string) {
  const email = normalizeEmail(input.email);
  const user = await findUserByEmail(email);
  if (!user?.passwordHash) {
    throw new AuthError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new AuthError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  if (user.email !== email) {
    await prisma.user.update({ where: { id: user.id }, data: { email } });
  }

  const session = await createSession(user.id);

  const userWithProfile = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      candidateProfile: { include: { activeRole: true } },
      recruiterProfile: true,
    },
  });

  await writeAudit({
    userId: user.id,
    action: "auth.login",
    entity: "User",
    entityId: user.id,
    ipAddress,
  });

  return { user: toPublicUser(userWithProfile!), sessionToken: session.token };
}

export async function createSession(userId: string) {
  const token = generateToken();
  return prisma.session.create({
    data: {
      userId,
      token,
      expiresAt: addDays(new Date(), SESSION_DAYS),
    },
  });
}

export async function logout(sessionToken: string, userId?: string) {
  await prisma.session.deleteMany({ where: { token: sessionToken } });
  if (userId) {
    await writeAudit({ userId, action: "auth.logout", entity: "Session" });
  }
}

export async function verifyEmail(token: string) {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record || record.usedAt) {
    throw new AuthError("Invalid or expired verification link", 400, "INVALID_TOKEN");
  }

  if (record.expiresAt < new Date()) {
    throw new AuthError("Verification link has expired", 400, "TOKEN_EXPIRED");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  await writeAudit({
    userId: record.userId,
    action: "auth.email_verified",
    entity: "User",
    entityId: record.userId,
  });

  const session = await createSession(record.userId);
  return { user: toPublicUser({ ...record.user, emailVerifiedAt: new Date() }), sessionToken: session.token };
}

export async function resendVerification(email: string) {
  const user = await findUserByEmail(normalizeEmail(email));
  if (!user || user.emailVerifiedAt) {
    return { message: "If an account exists, a verification email has been sent." };
  }

  await prisma.emailVerificationToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
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

  return {
    message: "If an account exists, a verification email has been sent.",
    verifyUrl,
  };
}

export async function getUserFromSession(sessionToken: string | undefined) {
  if (!sessionToken) return null;

  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: {
      user: {
        include: {
          candidateProfile: { include: { activeRole: true } },
          recruiterProfile: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  return session.user;
}
