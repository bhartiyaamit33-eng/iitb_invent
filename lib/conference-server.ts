import { randomBytes } from "node:crypto";
import { siteOrigin } from "@/lib/ticket";
import { DEFAULT_CONFERENCE_FEE_PAISE } from "@/lib/conference";

export function newConferenceToken(): string {
  return randomBytes(24).toString("hex");
}

export function abstractPdfPublicUrl(token: string): string {
  return `${siteOrigin()}/api/conference/abstract/${encodeURIComponent(token)}`;
}

export function conferencePayPath(token: string, start = false): string {
  const path = `/conference/pay/${encodeURIComponent(token)}`;
  return start ? `${path}?start=1` : path;
}

export function conferencePaymentUrl(token: string, start = false): string {
  return `${siteOrigin()}${conferencePayPath(token, start)}`;
}

export function conferenceFeePaise(): number {
  const n = Number(
    process.env.CONFERENCE_FEE_PAISE ||
      process.env.COLLOQUIUM_FEE_PAISE ||
      DEFAULT_CONFERENCE_FEE_PAISE,
  );
  return Number.isFinite(n) && n > 0
    ? Math.round(n)
    : DEFAULT_CONFERENCE_FEE_PAISE;
}

