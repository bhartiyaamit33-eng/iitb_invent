-- Public application numbers (INV2027-001). Existing rows are numbered in
-- application code, in arrival order, so this migration only adds the column.
ALTER TABLE "ColloquiumApplication" ADD COLUMN "applicationNumber" TEXT;

CREATE UNIQUE INDEX "ColloquiumApplication_applicationNumber_key" ON "ColloquiumApplication"("applicationNumber");
