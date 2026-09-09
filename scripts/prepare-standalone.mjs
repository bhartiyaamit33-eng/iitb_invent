#!/usr/bin/env node
/**
 * Next standalone does not reliably include public/ or .next/static.
 * Copy them into the standalone tree so `node .next/standalone/server.js`
 * can serve /assets/* (logos, hero photo) and hashed CSS/JS.
 *
 * Important: replace standalone/public entirely — `cp -r public standalone/public`
 * nests as public/public when standalone/public already exists.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
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

const serverChunksSrc = join(root, ".next", "server", "chunks");
if (existsSync(serverChunksSrc)) {
  const serverChunksDest = join(standalone, ".next", "server", "chunks");
  mkdirSync(serverChunksDest, { recursive: true });
  cpSync(serverChunksSrc, serverChunksDest, { recursive: true });
  console.log("prepare-standalone: copied .next/server/chunks → standalone");
}

const runtimePath = join(root, ".next", "server", "webpack-runtime.js");
if (existsSync(runtimePath)) {
  const src = readFileSync(runtimePath, "utf8");
  const missing = [];
  for (const match of src.matchAll(/["']\.\/chunks\/([^"']+)["']/g)) {
    const file = join(root, ".next", "server", "chunks", match[1]);
    if (!existsSync(file)) missing.push(match[1]);
  }
  if (missing.length) {
    console.error(
      "prepare-standalone: webpack-runtime.js references missing chunks:",
      missing.join(", "),
    );
    process.exit(1);
  }
}
