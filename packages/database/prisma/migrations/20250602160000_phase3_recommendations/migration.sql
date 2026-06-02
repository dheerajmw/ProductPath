-- CreateEnum
CREATE TYPE "SkillDevelopmentStatus" AS ENUM ('GAP_OPEN', 'IN_PROGRESS', 'MODULES_COMPLETED');

-- CreateTable
CREATE TABLE "SkillModuleMapping" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillModuleMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningRecommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "sourceAttemptId" TEXT NOT NULL,
    "moduleIds" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "LearningRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillDevelopmentSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "status" "SkillDevelopmentStatus" NOT NULL DEFAULT 'GAP_OPEN',
    "recommendedCompleted" INTEGER NOT NULL DEFAULT 0,
    "recommendedTotal" INTEGER NOT NULL DEFAULT 0,
    "sourceAttemptId" TEXT NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "SkillDevelopmentSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SkillModuleMapping_skillId_idx" ON "SkillModuleMapping"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillModuleMapping_skillId_moduleId_key" ON "SkillModuleMapping"("skillId", "moduleId");

-- CreateIndex
CREATE INDEX "LearningRecommendation_userId_roleId_idx" ON "LearningRecommendation"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningRecommendation_userId_roleId_skillId_sourceAttemptId_key" ON "LearningRecommendation"("userId", "roleId", "skillId", "sourceAttemptId");

-- CreateIndex
CREATE INDEX "SkillDevelopmentSnapshot_userId_roleId_idx" ON "SkillDevelopmentSnapshot"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillDevelopmentSnapshot_userId_roleId_skillId_key" ON "SkillDevelopmentSnapshot"("userId", "roleId", "skillId");

-- AddForeignKey
ALTER TABLE "SkillModuleMapping" ADD CONSTRAINT "SkillModuleMapping_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillModuleMapping" ADD CONSTRAINT "SkillModuleMapping_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningRecommendation" ADD CONSTRAINT "LearningRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningRecommendation" ADD CONSTRAINT "LearningRecommendation_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillDevelopmentSnapshot" ADD CONSTRAINT "SkillDevelopmentSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillDevelopmentSnapshot" ADD CONSTRAINT "SkillDevelopmentSnapshot_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
