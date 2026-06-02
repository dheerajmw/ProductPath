import { prisma } from "@productpath/database";
import { SubmissionStatus, VerificationState } from "@prisma/client";
import { isInterviewReadyState } from "./verification.service.js";
import { assertRecruiterVerified } from "./recruiter.service.js";

export class MarketplaceError extends Error {
  constructor(
    message: string,
    public statusCode = 400,
    public code?: string,
  ) {
    super(message);
    this.name = "MarketplaceError";
  }
}

const SEARCHABLE_STATES: VerificationState[] = [
  VerificationState.INTERVIEW_READY,
  VerificationState.VERIFIED_PROFESSIONAL,
];

export async function isCandidateDiscoverable(userId: string, roleId: string) {
  const discovery = await prisma.candidateDiscoverySettings.findUnique({
    where: { userId },
  });
  if (!discovery?.discoverable || discovery.roleId !== roleId) return false;

  const record = await prisma.verificationRecord.findUnique({
    where: { userId_roleId: { userId, roleId } },
  });
  if (!record || !isInterviewReadyState(record.state)) return false;
  if (record.expiresAt && record.expiresAt < new Date()) return false;
  return true;
}

export async function searchTalent(
  recruiterId: string,
  filters: { roleSlug?: string; q?: string },
) {
  await assertRecruiterVerified(recruiterId);
  const now = new Date();

  const settings = await prisma.candidateDiscoverySettings.findMany({
    where: { discoverable: true },
    include: {
      user: {
        include: {
          candidateProfile: {
            include: { activeRole: true },
          },
        },
      },
      role: true,
    },
  });

  const results: {
    id: string;
    displayName: string | null;
    role: { slug: string; name: string };
    verificationState: VerificationState;
    validUntil: string | null;
    overallScore: number | null;
    approvedProjects: number;
  }[] = [];

  for (const setting of settings) {
    const profile = setting.user.candidateProfile;
    if (!profile?.activeRoleId || profile.activeRoleId !== setting.roleId) continue;
    if (filters.roleSlug && profile.activeRole?.slug !== filters.roleSlug) continue;
    if (filters.q) {
      const q = filters.q.toLowerCase();
      const name = (profile.displayName ?? "").toLowerCase();
      if (!name.includes(q)) continue;
    }

    const record = await prisma.verificationRecord.findUnique({
      where: { userId_roleId: { userId: setting.userId, roleId: setting.roleId } },
    });
    if (!record || !SEARCHABLE_STATES.includes(record.state)) continue;
    if (record.expiresAt && record.expiresAt < now) continue;

    const latestResult = await prisma.assessmentResult.findFirst({
      where: { userId: setting.userId, roleId: setting.roleId, passed: true },
      orderBy: { createdAt: "desc" },
    });

    const approvedProjects = await prisma.projectSubmission.count({
      where: {
        userId: setting.userId,
        roleId: setting.roleId,
        status: SubmissionStatus.APPROVED,
      },
    });

    results.push({
      id: setting.userId,
      displayName: profile.displayName,
      role: {
        slug: profile.activeRole!.slug,
        name: profile.activeRole!.name,
      },
      verificationState: record.state,
      validUntil: record.expiresAt?.toISOString() ?? null,
      overallScore: latestResult?.overallScore ?? null,
      approvedProjects,
    });
  }

  return { candidates: results, total: results.length };
}

export async function getCandidateForRecruiter(recruiterId: string, candidateId: string) {
  await assertRecruiterVerified(recruiterId);
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: candidateId },
    include: { activeRole: true },
  });
  if (!profile?.activeRoleId || !profile.activeRole) {
    throw new MarketplaceError("Candidate not found", 404);
  }

  const discoverable = await isCandidateDiscoverable(candidateId, profile.activeRoleId);
  if (!discoverable) {
    throw new MarketplaceError("Candidate is not discoverable", 404, "NOT_DISCOVERABLE");
  }

  const record = await prisma.verificationRecord.findUnique({
    where: { userId_roleId: { userId: candidateId, roleId: profile.activeRoleId } },
  });

  const latestResult = await prisma.assessmentResult.findFirst({
    where: { userId: candidateId, roleId: profile.activeRoleId },
    orderBy: { createdAt: "desc" },
  });

  const approvedProjects = await prisma.projectSubmission.count({
    where: {
      userId: candidateId,
      roleId: profile.activeRoleId,
      status: SubmissionStatus.APPROVED,
    },
  });

  const existingInterest = await prisma.interestRequest.findFirst({
    where: { recruiterId, candidateId, status: "PENDING" },
  });

  return {
    candidate: {
      id: candidateId,
      displayName: profile.displayName,
      role: profile.activeRole,
      verification: {
        state: record?.state,
        validUntil: record?.expiresAt?.toISOString() ?? null,
      },
      evidence: {
        latestAssessmentScore: latestResult?.overallScore ?? null,
        passed: latestResult?.passed ?? false,
        approvedProjects,
      },
      hasPendingInterest: Boolean(existingInterest),
    },
  };
}

export async function updateDiscoverySettings(userId: string, discoverable: boolean) {
  const profile = await prisma.candidateProfile.findUnique({ where: { userId } });
  if (!profile?.activeRoleId) {
    throw new MarketplaceError("Select a product role first", 400, "NO_ACTIVE_ROLE");
  }

  const record = await prisma.verificationRecord.findUnique({
    where: { userId_roleId: { userId, roleId: profile.activeRoleId } },
  });
  const interviewReadyEligible =
    record &&
    isInterviewReadyState(record.state) &&
    (!record.expiresAt || record.expiresAt >= new Date());

  if (discoverable && !interviewReadyEligible) {
    throw new MarketplaceError(
      "Interview ready verification required before enabling discovery",
      400,
      "NOT_INTERVIEW_READY",
    );
  }

  const settings = await prisma.candidateDiscoverySettings.upsert({
    where: { userId },
    update: { discoverable, roleId: profile.activeRoleId },
    create: { userId, roleId: profile.activeRoleId, discoverable },
  });

  return {
    discoverable: settings.discoverable,
    roleId: settings.roleId,
    eligible: Boolean(interviewReadyEligible),
  };
}

export async function getDiscoverySettings(userId: string) {
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: { activeRole: true },
  });
  if (!profile?.activeRoleId) {
    throw new MarketplaceError("Select a product role first", 400, "NO_ACTIVE_ROLE");
  }

  const settings = await prisma.candidateDiscoverySettings.findUnique({ where: { userId } });

  const record = await prisma.verificationRecord.findUnique({
    where: { userId_roleId: { userId, roleId: profile.activeRoleId } },
  });

  const eligible =
    Boolean(record) &&
    isInterviewReadyState(record!.state) &&
    (!record!.expiresAt || record!.expiresAt >= new Date());

  return {
    discoverable: settings?.discoverable ?? false,
    eligible,
    role: profile.activeRole,
    verificationState: record?.state ?? VerificationState.LEARNING,
  };
}
