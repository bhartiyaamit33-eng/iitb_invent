-- AlterTable
ALTER TABLE "Sponsor" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'sponsor';
ALTER TABLE "Sponsor" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Sponsor" ALTER COLUMN "tier" SET DEFAULT 'standard';
