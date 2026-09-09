-- CreateEnum
CREATE TYPE "ApplicationPaymentStatus" AS ENUM ('NOT_REQUIRED', 'UNPAID', 'REPORTED', 'PAID', 'WAIVED');

-- AlterTable
ALTER TABLE "ColloquiumApplication"
ADD COLUMN "abstractViewToken" TEXT,
ADD COLUMN "paymentStatus" "ApplicationPaymentStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
ADD COLUMN "paymentAmountPaise" INTEGER NOT NULL DEFAULT 300000,
ADD COLUMN "paymentToken" TEXT,
ADD COLUMN "paymentRef" TEXT,
ADD COLUMN "paidAt" TIMESTAMP(3);

UPDATE "ColloquiumApplication"
SET "abstractViewToken" = substring(replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '') from 1 for 48)
WHERE "abstractViewToken" IS NULL;

UPDATE "ColloquiumApplication"
SET "paymentToken" = substring(replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '') from 1 for 48)
WHERE "paymentToken" IS NULL;

ALTER TABLE "ColloquiumApplication" ALTER COLUMN "abstractViewToken" SET NOT NULL;
ALTER TABLE "ColloquiumApplication" ALTER COLUMN "paymentToken" SET NOT NULL;

CREATE UNIQUE INDEX "ColloquiumApplication_abstractViewToken_key" ON "ColloquiumApplication"("abstractViewToken");
CREATE UNIQUE INDEX "ColloquiumApplication_paymentToken_key" ON "ColloquiumApplication"("paymentToken");
CREATE INDEX "ColloquiumApplication_paymentStatus_idx" ON "ColloquiumApplication"("paymentStatus");
