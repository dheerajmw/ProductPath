import { prisma } from "@productpath/database";
import { EMAIL_VERIFY_HOURS, changeEmailSchema } from "@productpath/shared";
import type { z } from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "./auth.service";
import { generateToken, addHours } from "../lib/tokens";
import { sendEmailChangeVerification } from "../lib/email";
import { writeAudit } from "../lib/audit";

const WEB_APP_URL = process.env.WEB_APP_URL ?? "http://localhost:3000";

type ChangeEmailInput = z.infer<typeof changeEmailSchema>;

export async function changeEmail(userId: string, input: ChangeEmailInput, ipAddress?: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.passwordHash) {
    throw new AuthError("User not found", 404);
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new AuthError("Invalid password", 401, "INVALID_PASSWORD");
  }

  const taken = await prisma.user.findUnique({ where: { email: input.newEmail } });
  if (taken && taken.id !== userId) {
    throw new AuthError("Email already in use", 409, "EMAIL_EXISTS");
  }

  const token = generateToken();
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      token,
      expiresAt: addHours(new Date(), EMAIL_VERIFY_HOURS),
    },
  });

  const verifyUrl = `${WEB_APP_URL}/verify-email?token=${token}&email=${encodeURIComponent(input.newEmail)}`;
  await sendEmailChangeVerification(input.newEmail, verifyUrl);

  await writeAudit({
    userId,
    action: "user.change_email_requested",
    metadata: { newEmail: input.newEmail },
    ipAddress,
  });

  return {
    message: "Verification email sent to your new address. Your login email updates after verification.",
  };
}
