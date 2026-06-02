import { prisma } from "@productpath/database";
import { ModuleProgressStatus, SubmissionStatus, VerificationState } from "@prisma/client";
import { writeAudit } from "../lib/audit";

export class VerificationError extends Error {
  constructor(
    message: string,
    public statusCode = 400,
    public code?: string,
  ) {
    super(message);
    this.name = "VerificationError";
  }
}

type PolicyConfig = {
  verification: {
    overall_pass_threshold: number;
    skill_floor_threshold: number;
    assessment_freshness_days: number;
    grace_period_days: number;
    verified_professional_min_score?: number;
  };
};

const DEFAULT_VERIFIED_PRO_SCORE = 85;

async function getPolicy(): Promise<PolicyConfig> {
  const row = await prisma.appConfig.findUnique({ where: { key: "verification_policy" } });
  const defaults: PolicyConfig = {
    verification: {
      overall_pass_threshold: 70,
      skill_floor_threshold: 50,
      assessment_freshness_days: 180,
      grace_period_days: 30,
      verified_professional_min_score: DEFAULT_VERIFIED_PRO_SCORE,
    },
  };
  if (!row?.value) return defaults;
  return { ...defaults, ...(row.value as object) } as PolicyConfig;
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

async function getActiveRoleId(userId: string) {
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: { activeRole: { select: { id: true, slug: true, name: true } } },
  });
  if (!profile?.activeRoleId || !profile.activeRole) {
    throw new VerificationError("Select a product role first", 400, "NO_ACTIVE_ROLE");
  }
  return { roleId: profile.activeRoleId, role: profile.activeRole };
}

type PassingAssessment = {
  id: string;
  overallScore: number;
  createdAt: Date;
  fresh: boolean;
  expiresAt: Date;
};

async function getLatestPassingAssessment(userId: string, roleId: string) {
  const results = await prisma.assessmentResult.findMany({
    where: { userId, roleId, passed: true },
    orderBy: { createdAt: "desc" },
  });
  return results[0] ?? null;
}

async function getFreshPassingAssessment(
  userId: string,
  roleId: string,
  policy: PolicyConfig,
): Promise<PassingAssessment | null> {
  const latest = await getLatestPassingAssessment(userId, roleId);
  if (!latest) return null;

  const expiresAt = addDays(latest.createdAt, policy.verification.assessment_freshness_days);
  const fresh = new Date() < expiresAt;

  return {
    id: latest.id,
    overallScore: latest.overallScore,
    createdAt: latest.createdAt,
    fresh,
    expiresAt,
  };
}

async function countApprovedProjects(userId: string, roleId: string) {
  return prisma.projectSubmission.count({
    where: { userId, roleId, status: SubmissionStatus.APPROVED },
  });
}

async function meetsEmergingTalent(userId: string, roleId: string) {
  const completedModules = await prisma.userModuleProgress.count({
    where: { userId, roleId, status: ModuleProgressStatus.COMPLETED },
  });
  if (completedModules >= 1) return true;

  const anyAttempt = await prisma.assessmentResult.findFirst({
    where: { userId, roleId },
  });
  return Boolean(anyAttempt);
}

function stateLabel(state: VerificationState) {
  switch (state) {
    case VerificationState.LEARNING:
      return "Learning";
    case VerificationState.EMERGING_TALENT:
      return "Emerging talent";
    case VerificationState.INTERVIEW_READY:
      return "Interview ready";
    case VerificationState.VERIFIED_PROFESSIONAL:
      return "Verified product professional";
    default:
      return state;
  }
}

export async function processVerificationExpiry() {
  const now = new Date();
  const expired = await prisma.verificationRecord.findMany({
    where: {
      expiresAt: { lt: now },
      state: { in: [VerificationState.INTERVIEW_READY, VerificationState.VERIFIED_PROFESSIONAL] },
    },
  });

  for (const record of expired) {
    await evaluateVerification(record.userId);
  }

  return { processed: expired.length };
}

export async function evaluateVerification(userId: string) {
  const { roleId, role } = await getActiveRoleId(userId);
  const policy = await getPolicy();
  const configRow = await prisma.appConfig.findUnique({ where: { key: "verification_policy" } });
  const policyVersion = configRow?.version ?? 1;

  const emerging = await meetsEmergingTalent(userId, roleId);
  const freshPassing = await getFreshPassingAssessment(userId, roleId, policy);
  const approvedCount = await countApprovedProjects(userId, roleId);

  const latestApproved = await prisma.projectSubmission.findFirst({
    where: { userId, roleId, status: SubmissionStatus.APPROVED },
    orderBy: { updatedAt: "desc" },
  });

  let state: VerificationState = VerificationState.LEARNING;
  if (emerging) state = VerificationState.EMERGING_TALENT;

  const assessmentMet = Boolean(freshPassing);
  const projectMet = approvedCount >= 1;

  if (assessmentMet && projectMet) {
    state = VerificationState.INTERVIEW_READY;
    const proThreshold =
      policy.verification.verified_professional_min_score ?? DEFAULT_VERIFIED_PRO_SCORE;
    if (approvedCount >= 2 || (freshPassing && freshPassing.overallScore >= proThreshold)) {
      state = VerificationState.VERIFIED_PROFESSIONAL;
    }
  }

  const expiresAt = freshPassing?.expiresAt ?? null;
  const eligibleForDiscovery =
    (state === VerificationState.INTERVIEW_READY ||
      state === VerificationState.VERIFIED_PROFESSIONAL) &&
    assessmentMet;

  const existingDiscovery = await prisma.candidateDiscoverySettings.findUnique({
    where: { userId },
  });
  let discoverable = existingDiscovery?.discoverable ?? false;
  if (!eligibleForDiscovery) discoverable = false;

  const record = await prisma.verificationRecord.upsert({
    where: { userId_roleId: { userId, roleId } },
    update: {
      state,
      policyVersion,
      assessmentResultId: freshPassing?.id ?? null,
      primarySubmissionId: latestApproved?.id ?? null,
      grantedAt: new Date(),
      expiresAt,
    },
    create: {
      userId,
      roleId,
      state,
      policyVersion,
      assessmentResultId: freshPassing?.id ?? null,
      primarySubmissionId: latestApproved?.id ?? null,
      expiresAt,
    },
  });

  await prisma.candidateDiscoverySettings.upsert({
    where: { userId },
    update: { roleId, discoverable },
    create: { userId, roleId, discoverable },
  });

  await writeAudit({
    userId,
    action: "verification.evaluated",
    entity: "VerificationRecord",
    entityId: record.id,
    metadata: { state, discoverable },
  });

  return buildVerificationResponse(userId, roleId, role, record, policy, {
    emerging,
    freshPassing,
    approvedCount,
    assessmentMet,
    projectMet,
  });
}

type ChecklistItem = {
  key: string;
  label: string;
  met: boolean;
  detail: string;
};

async function buildVerificationResponse(
  userId: string,
  roleId: string,
  role: { id: string; slug: string; name: string },
  record: {
    state: VerificationState;
    expiresAt: Date | null;
    grantedAt: Date;
    policyVersion: number;
  },
  policy: PolicyConfig,
  facts: {
    emerging: boolean;
    freshPassing: PassingAssessment | null;
    approvedCount: number;
    assessmentMet: boolean;
    projectMet: boolean;
  },
) {
  const latestAttempt = await prisma.assessmentResult.findFirst({
    where: { userId, roleId },
    orderBy: { createdAt: "desc" },
  });

  const anyPassing = await getLatestPassingAssessment(userId, roleId);

  const checklist: ChecklistItem[] = [
    {
      key: "role",
      label: "Active product role",
      met: true,
      detail: role.name,
    },
    {
      key: "emerging",
      label: "Emerging talent milestone (D-11)",
      met: facts.emerging,
      detail: facts.emerging
        ? "Completed learning or finished an assessment"
        : "Complete a module or finish an assessment attempt",
    },
    {
      key: "assessment_pass",
      label: `Passing assessment (≥${policy.verification.overall_pass_threshold}% overall, skills ≥${policy.verification.skill_floor_threshold}%)`,
      met: Boolean(anyPassing),
      detail: anyPassing
        ? `Latest passing score: ${Math.round(anyPassing.overallScore)}%`
        : latestAttempt
          ? `Latest score: ${Math.round(latestAttempt.overallScore)}% — not passing`
          : "No assessment completed",
    },
    {
      key: "assessment_fresh",
      label: `Assessment freshness (${policy.verification.assessment_freshness_days} days)`,
      met: facts.assessmentMet,
      detail: facts.freshPassing
        ? `Valid until ${facts.freshPassing.expiresAt.toISOString().slice(0, 10)}`
        : anyPassing
          ? "Passing assessment has expired — retake required"
          : "Requires a passing assessment",
    },
    {
      key: "approved_project",
      label: "Approved proof-of-work project",
      met: facts.projectMet,
      detail: `${facts.approvedCount} approved (need ≥1 for interview ready)`,
    },
    {
      key: "interview_ready",
      label: "Interview ready (D-09)",
      met:
        record.state === VerificationState.INTERVIEW_READY ||
        record.state === VerificationState.VERIFIED_PROFESSIONAL,
      detail: "Passing fresh assessment + ≥1 approved project",
    },
    {
      key: "verified_professional",
      label: "Verified product professional (D-10)",
      met: record.state === VerificationState.VERIFIED_PROFESSIONAL,
      detail: "Second approved project or overall ≥85% on fresh passing assessment",
    },
  ];

  const daysUntilExpiry = record.expiresAt
    ? Math.ceil((record.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    : null;

  const discovery = await prisma.candidateDiscoverySettings.findUnique({ where: { userId } });

  return {
    state: record.state,
    stateLabel: stateLabel(record.state),
    role,
    grantedAt: record.grantedAt.toISOString(),
    expiresAt: record.expiresAt?.toISOString() ?? null,
    daysUntilExpiry,
    expiringSoon: daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0,
    expired: daysUntilExpiry !== null && daysUntilExpiry <= 0,
    policyVersion: record.policyVersion,
    discoverable: discovery?.discoverable ?? false,
    discoveryEligible: isInterviewReadyState(record.state),
    checklist,
    badges: {
      emergingTalent: facts.emerging,
      interviewReady: record.state === VerificationState.INTERVIEW_READY,
      verifiedProfessional: record.state === VerificationState.VERIFIED_PROFESSIONAL,
    },
  };
}

export async function getVerificationForUser(userId: string) {
  return evaluateVerification(userId);
}

export async function getPublicCandidateProfile(candidateUserId: string) {
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: candidateUserId },
    include: {
      activeRole: { select: { id: true, slug: true, name: true } },
      user: { select: { id: true } },
    },
  });

  if (!profile?.activeRoleId || !profile.activeRole) {
    throw new VerificationError("Profile not available", 404, "PROFILE_NOT_FOUND");
  }

  const record = await prisma.verificationRecord.findUnique({
    where: {
      userId_roleId: { userId: candidateUserId, roleId: profile.activeRoleId },
    },
  });

  const discovery = await prisma.candidateDiscoverySettings.findUnique({
    where: { userId: candidateUserId },
  });

  const state = record?.state ?? VerificationState.LEARNING;

  return {
    id: profile.user.id,
    displayName: profile.displayName,
    role: profile.activeRole,
    verification: {
      state,
      stateLabel: stateLabel(state),
      validUntil: record?.expiresAt?.toISOString() ?? null,
      interviewReady: state === VerificationState.INTERVIEW_READY,
      verifiedProfessional: state === VerificationState.VERIFIED_PROFESSIONAL,
      discoverable: discovery?.discoverable ?? false,
    },
  };
}

export function isInterviewReadyState(state: VerificationState) {
  return (
    state === VerificationState.INTERVIEW_READY ||
    state === VerificationState.VERIFIED_PROFESSIONAL
  );
}

export async function assertInterviewReady(userId: string) {
  const { roleId } = await getActiveRoleId(userId);
  const record = await prisma.verificationRecord.findUnique({
    where: { userId_roleId: { userId, roleId } },
  });
  if (!record || !isInterviewReadyState(record.state)) {
    throw new VerificationError(
      "Interview ready verification required",
      403,
      "INTERVIEW_READY_REQUIRED",
    );
  }
  const discovery = await prisma.candidateDiscoverySettings.findUnique({ where: { userId } });
  if (!discovery?.discoverable) {
    throw new VerificationError("Not discoverable", 403, "NOT_DISCOVERABLE");
  }
}
