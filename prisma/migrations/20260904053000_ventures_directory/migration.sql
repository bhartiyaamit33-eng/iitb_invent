-- CreateEnum
CREATE TYPE "VentureKind" AS ENUM ('STARTUP', 'PROJECT', 'IDEA');

-- CreateTable
CREATE TABLE "Venture" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "editionId" TEXT,
    "kind" "VentureKind" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "websiteUrl" TEXT,
    "logoUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Venture_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Venture_slug_key" ON "Venture"("slug");

-- CreateIndex
CREATE INDEX "Venture_kind_isPublished_deletedAt_idx" ON "Venture"("kind", "isPublished", "deletedAt");

-- CreateIndex
CREATE INDEX "Venture_userId_idx" ON "Venture"("userId");

-- CreateIndex
CREATE INDEX "Venture_editionId_idx" ON "Venture"("editionId");

-- AddForeignKey
ALTER TABLE "Venture" ADD CONSTRAINT "Venture_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venture" ADD CONSTRAINT "Venture_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "Edition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
