import { randomBytes } from "node:crypto";
import { siteOrigin } from "@/lib/ticket";
import { DEFAULT_COLLOQUIUM_FEE_PAISE } from "@/lib/colloquium";

export function newColloquiumToken(): string {
  return randomBytes(24).toString("hex");
}

export function abstractPdfPublicUrl(token: string): string {
  return `${siteOrigin()}/api/colloquium/abstract/${encodeURIComponent(token)}`;
}

export function colloquiumPayPath(token: string, start = false): string {
  const path = `/colloquium/pay/${encodeURIComponent(token)}`;
  return start ? `${path}?start=1` : path;
}

export function colloquiumPaymentUrl(token: string, start = false): string {
  return `${siteOrigin()}${colloquiumPayPath(token, start)}`;
}

export function colloquiumFeePaise(): number {
  const n = Number(
    process.env.COLLOQUIUM_FEE_PAISE || DEFAULT_COLLOQUIUM_FEE_PAISE,
  );
  return Number.isFinite(n) && n > 0
    ? Math.round(n)
    : DEFAULT_COLLOQUIUM_FEE_PAISE;
}

