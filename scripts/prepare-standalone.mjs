#!/usr/bin/env node
/**
 * Next standalone does not reliably include public/ or .next/static.
 * Copy them into the standalone tree so `node .next/standalone/server.js`
 * can serve /assets/* (logos, hero photo) and hashed CSS/JS.
 *
 * Important: replace standalone/public entirely — `cp -r public standalone/public`
 * nests as public/public when standalone/public already exists.
 */
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standalone = join(root, ".next", "standalone");
const publicSrc = join(root, "public");
const staticSrc = join(root, ".next", "static");

if (!existsSync(standalone)) {
  console.error("prepare-standalone: .next/standalone missing — run next build first");
  process.exit(1);
}

const publicDest = join(standalone, "public");
rmSync(publicDest, { recursive: true, force: true });
cpSync(publicSrc, publicDest, { recursive: true });
console.log("prepare-standalone: copied public → .next/standalone/public");

if (existsSync(staticSrc)) {
  const staticParent = join(standalone, ".next");
  mkdirSync(staticParent, { recursive: true });
  const staticDest = join(staticParent, "static");
  rmSync(staticDest, { recursive: true, force: true });
  cpSync(staticSrc, staticDest, { recursive: true });
  console.log("prepare-standalone: copied .next/static → .next/standalone/.next/static");
}
