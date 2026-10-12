-- Payment gateway rewrite (October 2026). Additive only: the legacy payment
-- tables and ColloquiumApplication.op* / coupon / billing columns are kept.

-- AlterTable
ALTER TABLE "ColloquiumApplication" ADD COLUMN     "payerId" TEXT;

-- CreateTable
CREATE TABLE "GatewayPayment" (
    "transId" TEXT NOT NULL,
    "applicationId" TEXT,
    "payerId" TEXT NOT NULL,
    "reqId" TEXT,
    "amount" TEXT NOT NULL,
    "refNo" TEXT,
    "provId" TEXT,
    "imtStatus" TEXT,
    "imtDate" TEXT,
    "imtTime" TEXT,
    "imtAck" TEXT,
    "imtRaw" TEXT,
    "reconStatus" TEXT,
    "reconStamp" TEXT,
    "reconAck" TEXT,
    "reconRaw" TEXT,
    "dAck" TEXT,
    "dRaw" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "receiptMailedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GatewayPayment_pkey" PRIMARY KEY ("transId")
);

-- CreateIndex
CREATE INDEX "GatewayPayment_applicationId_idx" ON "GatewayPayment"("applicationId");

-- CreateIndex
CREATE INDEX "GatewayPayment_payerId_idx" ON "GatewayPayment"("payerId");

-- CreateIndex
CREATE INDEX "GatewayPayment_createdAt_idx" ON "GatewayPayment"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ColloquiumApplication_payerId_key" ON "ColloquiumApplication"("payerId");

-- AddForeignKey
ALTER TABLE "GatewayPayment" ADD CONSTRAINT "GatewayPayment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ColloquiumApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
