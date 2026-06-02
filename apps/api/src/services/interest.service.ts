import { prisma } from "@productpath/database";
import { InterestStatus } from "@prisma/client";
import { INTEREST_PENDING_DAYS } from "@productpath/shared";
import { writeAudit } from "../lib/audit.js";
import { isCandidateDiscoverable } from "./marketplace.service.js";
import { assertRecruiterVerified, RecruiterError } from "./recruiter.service.js";

export class InterestError extends Error {
  constructor(
    message: string,
    public statusCode = 400,
    public code?: string,
  ) {
    super(message);
    this.name = "InterestError";
  }
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export async function expirePendingInterests() {
  const now = new Date();
  const result = await prisma.interestRequest.updateMany({
    where: {
      status: InterestStatus.PENDING,
      expiresAt: { lt: now },
    },
    data: { status: InterestStatus.EXPIRED },
  });
  return { expired: result.count };
}

export async function sendInterest(recruiterId: string, candidateId: string, message: string) {
  await assertRecruiterVerified(recruiterId);

  if (recruiterId === candidateId) {
    throw new InterestError("Cannot send interest to yourself", 400);
  }

  const profile = await prisma.candidateProfile.findUnique({ where: { userId: candidateId } });
  if (!profile?.activeRoleId) {
    throw new InterestError("Candidate not found", 404);
  }

  const discoverable = await isCandidateDiscoverable(candidateId, profile.activeRoleId);
  if (!discoverable) {
    throw new InterestError("Candidate is not discoverable", 403, "NOT_DISCOVERABLE");
  }

  const existingPending = await prisma.interestRequest.findFirst({
    where: {
      recruiterId,
      candidateId,
      status: InterestStatus.PENDING,
    },
  });
  if (existingPending) {
    throw new InterestError("You already have a pending request", 400, "PENDING_EXISTS");
  }

  const expiresAt = addDays(new Date(), INTEREST_PENDING_DAYS);

  const interest = await prisma.interestRequest.create({
    data: {
      recruiterId,
      candidateId,
      message,
      status: InterestStatus.PENDING,
      expiresAt,
    },
  });

  await writeAudit({
    userId: recruiterId,
    action: "interest.sent",
    entity: "InterestRequest",
    entityId: interest.id,
    metadata: { candidateId },
  });

  return serializeInterest(interest);
}

function serializeInterest(interest: {
  id: string;
  recruiterId: string;
  candidateId: string;
  message: string;
  status: InterestStatus;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: interest.id,
    recruiterId: interest.recruiterId,
    candidateId: interest.candidateId,
    message: interest.message,
    status: interest.status,
    expiresAt: interest.expiresAt?.toISOString() ?? null,
    createdAt: interest.createdAt.toISOString(),
    updatedAt: interest.updatedAt.toISOString(),
  };
}

export async function respondToInterest(
  candidateId: string,
  interestId: string,
  action: "accept" | "decline",
) {
  const interest = await prisma.interestRequest.findUnique({
    where: { id: interestId },
    include: {
      connection: true,
      recruiter: {
        select: {
          email: true,
          recruiterProfile: { select: { company: true } },
        },
      },
    },
  });

  if (!interest || interest.candidateId !== candidateId) {
    throw new InterestError("Interest request not found", 404);
  }
  if (interest.status !== InterestStatus.PENDING) {
    throw new InterestError("Request is no longer pending", 400, "NOT_PENDING");
  }
  if (interest.expiresAt && interest.expiresAt < new Date()) {
    await prisma.interestRequest.update({
      where: { id: interestId },
      data: { status: InterestStatus.EXPIRED },
    });
    throw new InterestError("Request has expired", 400, "EXPIRED");
  }

  if (action === "decline") {
    const updated = await prisma.interestRequest.update({
      where: { id: interestId },
      data: { status: InterestStatus.DECLINED },
    });
    await writeAudit({
      userId: candidateId,
      action: "interest.declined",
      entity: "InterestRequest",
      entityId: interestId,
    });
    return { interest: serializeInterest(updated) };
  }

  const stillDiscoverable = await prisma.candidateProfile
    .findUnique({ where: { userId: candidateId } })
    .then(async (p) =>
      p?.activeRoleId ? isCandidateDiscoverable(candidateId, p.activeRoleId) : false,
    );
  if (!stillDiscoverable) {
    throw new InterestError("Your profile is no longer discoverable", 403);
  }

  const candidate = await prisma.user.findUnique({
    where: { id: candidateId },
    select: { email: true, candidateProfile: { select: { displayName: true } } },
  });

  const [updated] = await prisma.$transaction([
    prisma.interestRequest.update({
      where: { id: interestId },
      data: { status: InterestStatus.ACCEPTED },
    }),
    prisma.connection.create({
      data: { interestRequestId: interestId },
    }),
  ]);

  await writeAudit({
    userId: candidateId,
    action: "interest.accepted",
    entity: "InterestRequest",
    entityId: interestId,
  });

  return {
    interest: serializeInterest(updated),
    connection: {
      contactRevealedAt: new Date().toISOString(),
      recruiter: {
        email: interest.recruiter.email,
        company: interest.recruiter.recruiterProfile?.company ?? null,
      },
      candidate: {
        email: candidate!.email,
        displayName: candidate!.candidateProfile?.displayName ?? null,
      },
    },
  };
}

export async function listCandidateInterests(candidateId: string) {
  await expirePendingInterests();

  const interests = await prisma.interestRequest.findMany({
    where: { candidateId },
    orderBy: { createdAt: "desc" },
    include: {
      connection: true,
      recruiter: {
        select: {
          email: true,
          recruiterProfile: { select: { company: true, verified: true } },
        },
      },
    },
  });

  return {
    interests: interests.map((i) => ({
      ...serializeInterest(i),
      recruiter: {
        company: i.recruiter.recruiterProfile?.company ?? "Company",
        verified: i.recruiter.recruiterProfile?.verified ?? false,
      },
      connection: i.connection
        ? {
            contactRevealedAt: i.connection.contactRevealedAt.toISOString(),
            recruiterEmail:
              i.status === InterestStatus.ACCEPTED ? i.recruiter.email : undefined,
          }
        : null,
    })),
  };
}

export async function listRecruiterInterests(recruiterId: string) {
  await assertRecruiterVerified(recruiterId);
  await expirePendingInterests();

  const interests = await prisma.interestRequest.findMany({
    where: { recruiterId },
    orderBy: { createdAt: "desc" },
    include: {
      connection: true,
      candidate: {
        select: {
          email: true,
          candidateProfile: { select: { displayName: true } },
        },
      },
    },
  });

  return {
    interests: interests.map((i) => ({
      ...serializeInterest(i),
      candidate: {
        displayName: i.candidate.candidateProfile?.displayName ?? "Candidate",
      },
      connection: i.connection
        ? {
            contactRevealedAt: i.connection.contactRevealedAt.toISOString(),
            candidateEmail:
              i.status === InterestStatus.ACCEPTED ? i.candidate.email : undefined,
          }
        : null,
    })),
  };
}

export { RecruiterError };
