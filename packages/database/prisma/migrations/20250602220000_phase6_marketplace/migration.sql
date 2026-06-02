-- CreateEnum
CREATE TYPE "InterestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- AlterTable
ALTER TABLE "RecruiterProfile" ADD COLUMN "companyDomain" TEXT;

-- CreateTable
CREATE TABLE "InterestRequest" (
    "id" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "InterestStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "InterestRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Connection" (
    "id" TEXT NOT NULL,
    "interestRequestId" TEXT NOT NULL,
    "contactRevealedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Connection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InterestRequest_recruiterId_status_idx" ON "InterestRequest"("recruiterId", "status");
CREATE INDEX "InterestRequest_candidateId_status_idx" ON "InterestRequest"("candidateId", "status");
CREATE INDEX "InterestRequest_expiresAt_idx" ON "InterestRequest"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Connection_interestRequestId_key" ON "Connection"("interestRequestId");

-- AddForeignKey
ALTER TABLE "InterestRequest" ADD CONSTRAINT "InterestRequest_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InterestRequest" ADD CONSTRAINT "InterestRequest_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_interestRequestId_fkey" FOREIGN KEY ("interestRequestId") REFERENCES "InterestRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
