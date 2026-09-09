-- CreateEnum
CREATE TYPE "ProfessionalCategory" AS ENUM ('PHD_SCHOLAR', 'POSTDOC', 'PROFESSOR', 'INDUSTRY', 'OTHER');

-- CreateEnum
CREATE TYPE "PhdYear" AS ENUM ('YEARS_1_3', 'YEARS_4_5', 'YEAR_6_PLUS', 'THESIS_SUBMITTED');

-- CreateEnum
CREATE TYPE "PostdocSeeking" AS ENUM ('YES', 'NO', 'MAYBE');

-- CreateEnum
CREATE TYPE "ParticipationCategory" AS ENUM ('PAPER_ONLY', 'PAPER_OR_POSTER', 'POSTER_ONLY', 'ATTENDEE', 'OTHER');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('RECEIVED', 'SHORTLISTED_PAPER', 'SHORTLISTED_POSTER', 'ATTENDEE', 'WAITLISTED', 'REJECTED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "ColloquiumApplication" (
    "id" TEXT NOT NULL,
    "editionId" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "professionalCategory" "ProfessionalCategory" NOT NULL,
    "professionalOther" TEXT,
    "phdYear" "PhdYear",
    "seekingPostdoc" "PostdocSeeking",
    "participationCategory" "ParticipationCategory" NOT NULL,
    "participationOther" TEXT,
    "paperTitle" TEXT,
    "abstractFileName" TEXT,
    "abstractStorage" TEXT,
    "abstractStorageKey" TEXT,
    "sendCopy" BOOLEAN NOT NULL DEFAULT false,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'RECEIVED',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ColloquiumApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ColloquiumApplication_editionId_email_key" ON "ColloquiumApplication"("editionId", "email");

-- CreateIndex
CREATE INDEX "ColloquiumApplication_editionId_status_idx" ON "ColloquiumApplication"("editionId", "status");

-- CreateIndex
CREATE INDEX "ColloquiumApplication_createdAt_idx" ON "ColloquiumApplication"("createdAt");

-- AddForeignKey
ALTER TABLE "ColloquiumApplication" ADD CONSTRAINT "ColloquiumApplication_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "Edition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColloquiumApplication" ADD CONSTRAINT "ColloquiumApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
