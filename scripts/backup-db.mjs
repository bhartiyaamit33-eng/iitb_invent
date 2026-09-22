#!/usr/bin/env node
/**
 * Full database backup.
 *
 *   npm run db:backup                 → backups/invent-<utc-timestamp>.dump
 *   npm run db:backup -- --out PATH   → write somewhere specific
 *   npm run db:backup -- --plain      → plain SQL instead of custom format
 *
 * Read-only against the database: it runs pg_dump and nothing else, so it is
 * safe to run on production while the site is serving. Restore instructions are
 * printed on success and repeated in the README.
 *
 * The connection password is never printed, and never passed on argv where it
 * would show up in `ps`.
 */
import { spawn } from "node:child_process";
import { mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";

/**
 * Prisma accepts connection params libpq does not (`schema`, `connection_limit`,
 * `pgbouncer`, …) and pg_dump hard-fails on them, so keep only what libpq knows.
 */
const LIBPQ_PARAMS = new Set([
  "application_name",
  "connect_timeout",
  "options",
  "sslmode",
  "sslcert",
  "sslkey",
  "sslrootcert",
  "sslcrl",
  "target_session_attrs",
]);

function toLibpqUrl(raw) {
  const url = new URL(raw);
  for (const key of [...url.searchParams.keys()]) {
    if (!LIBPQ_PARAMS.has(key)) url.searchParams.delete(key);
  }
  return url;
}

const argv = process.argv.slice(2);

function flagValue(name) {
  const i = argv.indexOf(name);
  return i !== -1 ? argv[i + 1] : undefined;
}

const plain = argv.includes("--plain");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error(
    "DATABASE_URL is not set. Run this where the app runs, or pass it inline:\n" +
      "  DATABASE_URL='postgresql://…' npm run db:backup",
  );
  process.exit(1);
}

let parsed;
try {
  parsed = toLibpqUrl(url);
} catch {
  console.error("DATABASE_URL is not a valid URL.");
  process.exit(1);
}

const database = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
if (!database) {
  console.error("DATABASE_URL has no database name.");
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-").replace(/Z$/, "Z");
const ext = plain ? "sql" : "dump";
const outPath = path.resolve(
  flagValue("--out") ?? path.join("backups", `${database}-${stamp}.${ext}`),
);

// Refuse to clobber an existing backup: a silently overwritten backup is worse
// than no backup.
try {
  await stat(outPath);
  console.error(`Refusing to overwrite an existing file: ${outPath}`);
  process.exit(1);
} catch {
  /* does not exist, which is what we want */
}

await mkdir(path.dirname(outPath), { recursive: true });

const args = [
  "--dbname",
  parsed.toString(),
  "--no-owner",
  "--no-privileges",
  "--file",
  outPath,
];
if (plain) args.push("--format=plain");
else args.push("--format=custom", "--compress=9");

console.log(`Backing up "${database}" on ${parsed.hostname}:${parsed.port || 5432} …`);

const child = spawn("pg_dump", args, {
  stdio: ["ignore", "inherit", "inherit"],
  env: process.env,
});

child.on("error", (err) => {
  if (err.code === "ENOENT") {
    console.error(
      "pg_dump was not found on PATH.\n" +
        "  Ubuntu/Debian: sudo apt-get install -y postgresql-client\n" +
        "  Docker Postgres: docker compose exec -T postgres pg_dump …",
    );
    process.exit(1);
  }
  console.error(err.message);
  process.exit(1);
});

/** A 0-byte file left behind by a failed dump looks exactly like a backup. */
async function discardPartial() {
  await rm(outPath, { force: true });
}

child.on("exit", async (code) => {
  if (code !== 0) {
    await discardPartial();
    console.error(`pg_dump exited with code ${code}. No backup was written.`);
    process.exit(code ?? 1);
  }
  const { size } = await stat(outPath);
  if (size === 0) {
    await discardPartial();
    console.error("pg_dump wrote an empty file, so nothing was kept. Treat this as a FAILED backup.");
    process.exit(1);
  }
  const mb = (size / 1024 / 1024).toFixed(2);
  console.log(`\nBackup written: ${outPath} (${mb} MB)`);
  console.log("\nRestore into a NEW database (never straight over a live one):");
  if (plain) {
    console.log(`  createdb ${database}_restored`);
    console.log(`  psql --dbname ${database}_restored --file ${outPath}`);
  } else {
    console.log(`  createdb ${database}_restored`);
    console.log(`  pg_restore --dbname ${database}_restored --no-owner --no-privileges ${outPath}`);
  }
  console.log("\nThen point DATABASE_URL at the restored database to verify it before relying on it.");
});
