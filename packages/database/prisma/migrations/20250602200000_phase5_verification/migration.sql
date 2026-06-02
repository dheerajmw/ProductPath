-- CreateEnum
CREATE TYPE "VerificationState" AS ENUM ('LEARNING', 'EMERGING_TALENT', 'INTERVIEW_READY', 'VERIFIED_PROFESSIONAL');

-- CreateTable
CREATE TABLE "VerificationRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "state" "VerificationState" NOT NULL DEFAULT 'LEARNING',
    "policyVersion" INTEGER NOT NULL DEFAULT 1,
    "assessmentResultId" TEXT,
    "primarySubmissionId" TEXT,
    "grantedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "VerificationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateDiscoverySettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "discoverable" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "CandidateDiscoverySettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationRecord_userId_roleId_key" ON "VerificationRecord"("userId", "roleId");
CREATE INDEX "VerificationRecord_state_idx" ON "VerificationRecord"("state");
CREATE INDEX "VerificationRecord_expiresAt_idx" ON "VerificationRecord"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateDiscoverySettings_userId_key" ON "CandidateDiscoverySettings"("userId");

-- AddForeignKey
ALTER TABLE "VerificationRecord" ADD CONSTRAINT "VerificationRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VerificationRecord" ADD CONSTRAINT "VerificationRecord_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VerificationRecord" ADD CONSTRAINT "VerificationRecord_assessmentResultId_fkey" FOREIGN KEY ("assessmentResultId") REFERENCES "AssessmentResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VerificationRecord" ADD CONSTRAINT "VerificationRecord_primarySubmissionId_fkey" FOREIGN KEY ("primarySubmissionId") REFERENCES "ProjectSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateDiscoverySettings" ADD CONSTRAINT "CandidateDiscoverySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CandidateDiscoverySettings" ADD CONSTRAINT "CandidateDiscoverySettings_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
