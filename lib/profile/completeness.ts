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
  /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w\-À-ÿ%]+\/?$/i;

export function normaliseLinkedInUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  let url = trimmed;
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  try {
    const u = new URL(url);
    if (!u.hostname.replace(/^www\./, "").endsWith("linkedin.com")) return null;
    const path = u.pathname.replace(/\/$/, "");
    const normalised = `https://www.linkedin.com${path}`;
    if (!LINKEDIN_URL_RE.test(normalised + "/")) return null;
    return normalised.replace(/\/$/, "");
  } catch {
    return null;
  }
}
