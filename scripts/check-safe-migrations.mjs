import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const migrationsDir = path.join(process.cwd(), "prisma", "migrations");

const destructivePatterns = [
  ["DELETE FROM", /\bDELETE\s+FROM\b/i],
  ["TRUNCATE", /\bTRUNCATE\b/i],
  ["DROP TABLE", /\bDROP\s+TABLE\b/i],
  ["DROP COLUMN", /\bDROP\s+COLUMN\b/i],
  ["DROP TYPE", /\bDROP\s+TYPE\b/i],
  ["data UPDATE", /\bUPDATE\s+(?:"[^"]+"|[a-z_][\w.]*)\s+SET\b/i],
];

function withoutComments(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/--.*$/gm, "");
}

async function appliedMigrationNames() {
  try {
    const rows = await prisma.$queryRawUnsafe(
      'SELECT "migration_name" FROM "_prisma_migrations" WHERE "finished_at" IS NOT NULL AND "rolled_back_at" IS NULL',
    );
    return new Set(rows.map((row) => row.migration_name));
  } catch {
    // A brand-new database has no migration ledger yet.
    return new Set();
  }
}

async function main() {
  const applied = await appliedMigrationNames();
  const entries = await readdir(migrationsDir, { withFileTypes: true });
  const violations = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || applied.has(entry.name)) continue;
    const migrationPath = path.join(migrationsDir, entry.name, "migration.sql");
    const sql = withoutComments(await readFile(migrationPath, "utf8"));
    for (const [label, pattern] of destructivePatterns) {
      if (pattern.test(sql)) violations.push(`${entry.name}: ${label}`);
    }
  }

  if (violations.length > 0) {
    throw new Error(
      [
        "REFUSING DATABASE DEPLOYMENT.",
        "Pending migrations contain statements that can modify or remove existing data:",
        ...violations.map((violation) => `- ${violation}`),
        "Create an additive migration or perform a separately reviewed recovery-safe data operation.",
      ].join("\n"),
    );
  }

  console.log("Database safety check passed: pending migrations are additive.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
