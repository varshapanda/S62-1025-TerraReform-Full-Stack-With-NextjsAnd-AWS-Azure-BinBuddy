-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PENDING', 'VIEWED', 'COMPLETED', 'SKIPPED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "assignedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 5;

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "status" "AssignmentStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "decision" "ReportStatus" NOT NULL,
    "verificationNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Assignment_volunteerId_status_idx" ON "Assignment"("volunteerId", "status");

-- CreateIndex
CREATE INDEX "Assignment_reportId_status_idx" ON "Assignment"("reportId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_reportId_volunteerId_key" ON "Assignment"("reportId", "volunteerId");

-- CreateIndex
CREATE INDEX "Verification_reportId_idx" ON "Verification"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "Verification_reportId_volunteerId_key" ON "Verification"("reportId", "volunteerId");

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
