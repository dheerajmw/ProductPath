/**
 * Background job queue. In development, verification expiry runs inline when enqueued.
 */
export type JobName = "verification.expire" | "interest.expire" | "email.send";

export async function enqueue(name: JobName, _payload: Record<string, unknown>) {
  if (name === "verification.expire") {
    const { processVerificationExpiry } = await import("../services/verification.service.js");
    const result = await processVerificationExpiry();
    return { id: "inline", status: "completed" as const, result };
  }

  if (name === "interest.expire") {
    const { expirePendingInterests } = await import("../services/interest.service.js");
    const result = await expirePendingInterests();
    return { id: "inline", status: "completed" as const, result };
  }

  if (process.env.NODE_ENV === "development") {
    return { id: "stub", status: "queued" as const };
  }
  throw new Error("Job queue not configured. Set REDIS_URL and implement worker.");
}
