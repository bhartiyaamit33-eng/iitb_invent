import type { VentureKind } from "@prisma/client";

export function ventureInitials(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) return "?";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  const alnum = cleaned.replace(/[^a-zA-Z0-9]/g, "");
  return (alnum.slice(0, 2) || cleaned.slice(0, 2)).toUpperCase();
}

export function slugifyVenture(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export function normalizeWebsiteUrl(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    const u = new URL(withProto);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

export const VENTURE_KIND_LABEL: Record<VentureKind, string> = {
  STARTUP: "Startup",
  PROJECT: "Project",
  IDEA: "Idea",
};
