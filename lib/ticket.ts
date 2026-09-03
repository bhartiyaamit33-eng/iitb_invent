/** Resolve public site origin for QR / absolute links. */
export function siteOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    "https://iitbinvent.com";
  return raw.replace(/\/$/, "");
}

/** Public badge URL encoded in the attendee QR. */
export function ticketBadgeUrl(qrToken: string): string {
  return `${siteOrigin()}/t/${qrToken}`;
}

/**
 * Accept either a raw qrToken or a full badge URL (/t/… or ?token=).
 */
export function extractQrToken(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  try {
    const u = new URL(trimmed);
    const pathMatch = u.pathname.match(/\/t\/([A-Za-z0-9_-]+)/);
    if (pathMatch?.[1]) return pathMatch[1];
    const q = u.searchParams.get("token") ?? u.searchParams.get("qr");
    if (q) return q.trim();
  } catch {
    /* not a URL */
  }

  const bare = trimmed.match(/\/t\/([A-Za-z0-9_-]+)/);
  if (bare?.[1]) return bare[1];

  return trimmed.split(/[?\s#]/)[0] ?? trimmed;
}
