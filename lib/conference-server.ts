import { randomBytes } from "node:crypto";
import { siteOrigin } from "@/lib/ticket";
import {
  conferenceFeePaiseFor,
  type ProfessionalCategory,
} from "@/lib/conference";

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

export function conferenceFeePaise(category: ProfessionalCategory): number {
  return conferenceFeePaiseFor(category);
}

