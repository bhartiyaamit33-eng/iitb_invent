import type { PersonaType } from "@prisma/client";

/** Weighted profile completeness 0–100 (PRD §8). */
export function computeCompleteness(input: {
  personaType?: PersonaType | null;
  headline?: string | null;
  organisation?: string | null;
  linkedinUrl?: string | null;
  image?: string | null;
  bio?: string | null;
  interests?: string[] | null;
}): number {
  let score = 0;
  if (input.personaType) score += 20;
  if (input.headline?.trim()) score += 15;
  if (input.organisation?.trim()) score += 15;
  if (input.linkedinUrl?.trim()) score += 25;
  if (input.image?.trim()) score += 10;
  if (input.bio?.trim()) score += 10;
  if ((input.interests?.length ?? 0) >= 1) score += 5;
  return Math.min(100, score);
}

export const LINKEDIN_URL_RE =
  /^https?:\/\/(www\.)?linkedin\.com\/(in|pub|company)\/[\w\-À-ÿ%.]+\/?/i;

/**
 * Accepts a full LinkedIn URL, `linkedin.com/in/…`, or just a profile slug.
 * Returns a normalised https URL, or null if empty/invalid.
 */
export function normaliseLinkedInUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let candidate = trimmed;
  // Bare slug → assume /in/
  if (!/[./]/.test(candidate) && /^[\w\-À-ÿ%]+$/i.test(candidate)) {
    candidate = `https://www.linkedin.com/in/${candidate}`;
  } else if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate.replace(/^\/+/, "")}`;
  }

  try {
    const u = new URL(candidate);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host !== "linkedin.com" && host !== "lnkd.in") return null;
    if (host === "lnkd.in") return u.toString().replace(/\/$/, "");

    const path = u.pathname.replace(/\/+$/, "") || "";
    if (!/^\/(in|pub|company)\/[\w\-À-ÿ%.]+/i.test(path)) return null;
    return `https://www.linkedin.com${path}`;
  } catch {
    return null;
  }
}

/** Strip known prefixes so the slug field can show only the handle. */
export function linkedInSlugFromUrl(url: string | null | undefined): string {
  if (!url?.trim()) return "";
  try {
    const u = new URL(
      /^https?:\/\//i.test(url) ? url : `https://${url}`,
    );
    const m = u.pathname.match(/^\/in\/([^/]+)/i);
    return m?.[1] ?? "";
  } catch {
    return url.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "").replace(/\/$/, "");
  }
}
