-- MVP AI Assessment V1

CREATE TYPE "MvpSessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

CREATE TABLE "AssessmentSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleSlug" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "status" "MvpSessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "questionIds" JSONB NOT NULL,
    "currentIndex" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ,
    "completedAt" TIMESTAMPTZ,
    "overallScore" DOUBLE PRECISION,
    "readinessLevel" TEXT,
    "passed" BOOLEAN,
    "skillBreakdown" JSONB,
    "weakAreas" JSONB,
    "recommendations" JSONB,
    "aiFeedback" TEXT,

    CONSTRAINT "AssessmentSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuestionResponse" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionBankId" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "skillTag" TEXT NOT NULL,
    "selectedIndex" INTEGER,
    "textAnswer" TEXT,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "aiEvaluation" JSONB,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "QuestionResponse_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SkillScore" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "skillTag" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "percent" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SkillScore_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserAssessmentHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleSlug" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "readinessLevel" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "completedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "UserAssessmentHistory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "QuestionResponse_sessionId_questionBankId_key" ON "QuestionResponse"("sessionId", "questionBankId");
CREATE INDEX "QuestionResponse_sessionId_idx" ON "QuestionResponse"("sessionId");
CREATE UNIQUE INDEX "SkillScore_sessionId_skillTag_key" ON "SkillScore"("sessionId", "skillTag");
CREATE UNIQUE INDEX "UserAssessmentHistory_sessionId_key" ON "UserAssessmentHistory"("sessionId");
CREATE INDEX "UserAssessmentHistory_userId_roleSlug_idx" ON "UserAssessmentHistory"("userId", "roleSlug");
CREATE INDEX "AssessmentSession_userId_roleSlug_idx" ON "AssessmentSession"("userId", "roleSlug");
CREATE INDEX "AssessmentSession_status_idx" ON "AssessmentSession"("status");

ALTER TABLE "AssessmentSession" ADD CONSTRAINT "AssessmentSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuestionResponse" ADD CONSTRAINT "QuestionResponse_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AssessmentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SkillScore" ADD CONSTRAINT "SkillScore_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AssessmentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserAssessmentHistory" ADD CONSTRAINT "UserAssessmentHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserAssessmentHistory" ADD CONSTRAINT "UserAssessmentHistory_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AssessmentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "FeatureFlag" ("key", "enabled", "description")
VALUES ('mvp_assessment', true, 'MVP AI-powered role assessments')
ON CONFLICT ("key") DO UPDATE SET "enabled" = true;
