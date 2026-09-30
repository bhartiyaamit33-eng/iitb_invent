-- CreateTable
CREATE TABLE "OnlinePayAck" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "transId" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "ackedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnlinePayAck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OnlinePayAck_transId_requestType_key" ON "OnlinePayAck"("transId", "requestType");

-- CreateIndex
CREATE INDEX "OnlinePayAck_ackedAt_idx" ON "OnlinePayAck"("ackedAt");

-- AddForeignKey
ALTER TABLE "OnlinePayAck" ADD CONSTRAINT "OnlinePayAck_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ColloquiumApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
