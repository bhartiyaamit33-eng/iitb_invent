ALTER TYPE "Role" ADD VALUE 'REVIEWER' BEFORE 'ORGANISER';

CREATE TYPE "ReviewAssignmentStatus" AS ENUM (
  'ASSIGNED',
  'IN_PROGRESS',
  'COMPLETED'
);

CREATE TYPE "ReviewRecommendation" AS ENUM (
  'STRONG_ACCEPT',
  'ACCEPT',
  'WEAK_ACCEPT',
  'BORDERLINE',
  'WEAK_REJECT',
  'REJECT'
);

CREATE TABLE "ApplicationReview" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "reviewerId" TEXT NOT NULL,
  "assignedById" TEXT,
  "status" "ReviewAssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
  "expertise" INTEGER,
  "score" INTEGER,
  "recommendation" "ReviewRecommendation",
  "publicComments" TEXT,
  "confidentialComments" TEXT,
  "dueAt" TIMESTAMP(3),
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startedAt" TIMESTAMP(3),
  "submittedAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ApplicationReview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ApplicationReview_applicationId_reviewerId_key"
  ON "ApplicationReview"("applicationId", "reviewerId");
CREATE INDEX "ApplicationReview_reviewerId_status_idx"
  ON "ApplicationReview"("reviewerId", "status");
CREATE INDEX "ApplicationReview_applicationId_status_idx"
  ON "ApplicationReview"("applicationId", "status");

ALTER TABLE "ApplicationReview"
  ADD CONSTRAINT "ApplicationReview_applicationId_fkey"
  FOREIGN KEY ("applicationId") REFERENCES "ColloquiumApplication"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApplicationReview"
  ADD CONSTRAINT "ApplicationReview_reviewerId_fkey"
  FOREIGN KEY ("reviewerId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApplicationReview"
  ADD CONSTRAINT "ApplicationReview_assignedById_fkey"
  FOREIGN KEY ("assignedById") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
