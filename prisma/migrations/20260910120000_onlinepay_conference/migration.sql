-- AlterTable
ALTER TABLE "ColloquiumApplication" ADD COLUMN "opReqId" TEXT;
ALTER TABLE "ColloquiumApplication" ADD COLUMN "opUserId" TEXT;
ALTER TABLE "ColloquiumApplication" ADD COLUMN "opTransId" TEXT;
ALTER TABLE "ColloquiumApplication" ADD COLUMN "opRefNo" TEXT;
ALTER TABLE "ColloquiumApplication" ADD COLUMN "opProvId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ColloquiumApplication_opReqId_key" ON "ColloquiumApplication"("opReqId");

-- CreateIndex
CREATE INDEX "ColloquiumApplication_opTransId_idx" ON "ColloquiumApplication"("opTransId");
