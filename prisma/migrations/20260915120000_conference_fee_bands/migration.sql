-- Category-based conference fees: student ₹5,000, faculty ₹10,000, industry ₹20,000.
-- Do not rewrite amounts already collected or waived.
ALTER TABLE "ColloquiumApplication" ALTER COLUMN "paymentAmountPaise" SET DEFAULT 500000;

UPDATE "ColloquiumApplication"
SET "paymentAmountPaise" = CASE "professionalCategory"
  WHEN 'PHD_SCHOLAR' THEN 500000
  WHEN 'POSTDOC' THEN 500000
  WHEN 'PROFESSOR' THEN 1000000
  WHEN 'OTHER' THEN 1000000
  WHEN 'INDUSTRY' THEN 2000000
  ELSE 500000
END
WHERE "paymentStatus" NOT IN ('PAID', 'WAIVED');
