-- AlterTable
ALTER TABLE "ColloquiumApplication" ADD COLUMN     "billingAddress" TEXT,
ADD COLUMN     "billingGstin" TEXT,
ADD COLUMN     "billingName" TEXT,
ADD COLUMN     "couponId" TEXT,
ADD COLUMN     "discountPaise" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "gstInvoiceRef" TEXT,
ADD COLUMN     "gstInvoiceUrl" TEXT;

-- CreateTable
CREATE TABLE "PaymentCoupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentCoupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAttempt" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountPaise" INTEGER NOT NULL,
    "environment" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'INITIATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentEvent" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT,
    "attemptId" TEXT,
    "kind" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "requestId" TEXT,
    "transId" TEXT,
    "amount" TEXT,
    "reason" TEXT,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentReceipt" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "amountPaise" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentCoupon_code_key" ON "PaymentCoupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAttempt_requestId_key" ON "PaymentAttempt"("requestId");

-- CreateIndex
CREATE INDEX "PaymentAttempt_applicationId_createdAt_idx" ON "PaymentAttempt"("applicationId", "createdAt");

-- CreateIndex
CREATE INDEX "PaymentEvent_applicationId_createdAt_idx" ON "PaymentEvent"("applicationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentReceipt_applicationId_key" ON "PaymentReceipt"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentReceipt_number_key" ON "PaymentReceipt"("number");

-- AddForeignKey
ALTER TABLE "ColloquiumApplication" ADD CONSTRAINT "ColloquiumApplication_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "PaymentCoupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ColloquiumApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentEvent" ADD CONSTRAINT "PaymentEvent_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ColloquiumApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentEvent" ADD CONSTRAINT "PaymentEvent_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "PaymentAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceipt" ADD CONSTRAINT "PaymentReceipt_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ColloquiumApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

