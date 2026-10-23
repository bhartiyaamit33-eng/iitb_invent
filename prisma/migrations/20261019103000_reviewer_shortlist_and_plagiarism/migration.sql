CREATE TYPE "ReviewDecision" AS ENUM (
  'SHORTLIST_PAPER',
  'SHORTLIST_POSTER',
  'NOT_SELECTED'
);

CREATE TYPE "PlagiarismStatus" AS ENUM (
  'NOT_CHECKED',
  'CLEAR',
  'FLAGGED'
);

ALTER TABLE "ApplicationReview" ADD COLUMN "decision" "ReviewDecision";

ALTER TABLE "ColloquiumApplication"
  ADD COLUMN "plagiarismStatus" "PlagiarismStatus" NOT NULL DEFAULT 'NOT_CHECKED',
  ADD COLUMN "plagiarismNotes" TEXT,
  ADD COLUMN "plagiarismCheckedAt" TIMESTAMP(3);
