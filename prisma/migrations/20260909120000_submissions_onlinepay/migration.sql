-- CreateEnum
CREATE TYPE "SubmissionKind" AS ENUM ('PAPER', 'POSTER', 'WORKSHOP');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "PayerCategory" AS ENUM ('STUDENT', 'FACULTY', 'CORPORATE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'IN_FLIGHT', 'SUCCESS', 'FAILED', 'SETTLED', 'REFUNDED');

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "editionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "SubmissionKind" NOT NULL,
    "title" TEXT NOT NULL,
    "abstract" TEXT,
    "authors" TEXT,
    "organisation" TEXT,
    "fileUrl" TEXT,
    "payerCategory" "PayerCategory" NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "editionId" TEXT NOT NULL,
    "reqId" TEXT NOT NULL,
    "payToken" TEXT NOT NULL,
    "invoiceNumber" TEXT,
    "appId" TEXT NOT NULL,
    "opUserId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "purpose" TEXT NOT NULL,
    "payerCategory" "PayerCategory" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transId" TEXT,
    "refNo" TEXT,
    "provId" TEXT,
    "pgStatus" TEXT,
    "msg" TEXT,
    "transDate" TEXT,
    "transTime" TEXT,
    "immediateRaw" JSONB,
    "immediateAt" TIMESTAMP(3),
    "reconDate" TEXT,
    "reconTime" TEXT,
    "reconRaw" JSONB,
    "settledAt" TIMESTAMP(3),
    "refundAmount" DECIMAL(12,2),
    "refundAt" TIMESTAMP(3),
    "refundRaw" JSONB,
    "paymentLinkSentAt" TIMESTAMP(3),
    "invoiceSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Submission_editionId_status_idx" ON "Submission"("editionId", "status");

-- CreateIndex
CREATE INDEX "Submission_userId_idx" ON "Submission"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_reqId_key" ON "Payment"("reqId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_payToken_key" ON "Payment"("payToken");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_invoiceNumber_key" ON "Payment"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Payment_editionId_status_idx" ON "Payment"("editionId", "status");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_transId_idx" ON "Payment"("transId");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "Edition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "Edition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
