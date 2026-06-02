import { logger } from "./logger";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "ProductPath <onboarding@resend.dev>";

export function isEmailDeliveryConfigured(): boolean {
  return Boolean(RESEND_API_KEY);
}

/** True when the verify link should be returned to the client (local dev without Resend). */
export function shouldExposeDevVerifyUrl(): boolean {
  return process.env.NODE_ENV !== "production" || !isEmailDeliveryConfigured();
}

async function sendViaResend(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: EMAIL_FROM, to: [to], subject, html }),
  });

  if (!res.ok) {
    const body = await res.text();
    logger.error({ status: res.status, body }, "Resend API error");
    throw new Error("Failed to send email");
  }
}

export async function sendVerificationEmail(email: string, verifyUrl: string) {
  const subject = "Verify your ProductPath email";
  const html = `
    <p>Thanks for signing up. Click the link below to verify your email (valid for 24 hours):</p>
    <p><a href="${verifyUrl}">Verify email</a></p>
    <p>Or copy this URL: ${verifyUrl}</p>
  `.trim();

  if (RESEND_API_KEY) {
    await sendViaResend(email, subject, html);
    logger.info({ email }, "verification email sent via Resend");
    return;
  }

  logger.info(
    { email, verifyUrl },
    `[dev] Email verification link for ${email}: ${verifyUrl}`,
  );
}

export async function sendEmailChangeVerification(email: string, verifyUrl: string) {
  const subject = "Confirm your new ProductPath email";
  const html = `<p><a href="${verifyUrl}">Confirm email change</a></p>`;

  if (RESEND_API_KEY) {
    await sendViaResend(email, subject, html);
    return;
  }

  logger.info(
    { email, verifyUrl },
    `[dev] Email change verification for ${email}: ${verifyUrl}`,
  );
}
