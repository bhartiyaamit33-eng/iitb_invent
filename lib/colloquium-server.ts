import { randomBytes } from "node:crypto";
import { siteOrigin } from "@/lib/ticket";
import { DEFAULT_COLLOQUIUM_FEE_PAISE } from "@/lib/colloquium";

export function newColloquiumToken(): string {
  return randomBytes(24).toString("hex");
}

export function abstractPdfPublicUrl(token: string): string {
  return `${siteOrigin()}/api/colloquium/abstract/${encodeURIComponent(token)}`;
}

export function colloquiumPaymentUrl(token: string): string {
  return `${siteOrigin()}/colloquium/pay/${encodeURIComponent(token)}`;
}

export function colloquiumFeePaise(): number {
  const n = Number(
    process.env.COLLOQUIUM_FEE_PAISE || DEFAULT_COLLOQUIUM_FEE_PAISE,
  );
  return Number.isFinite(n) && n > 0
    ? Math.round(n)
    : DEFAULT_COLLOQUIUM_FEE_PAISE;
}

export function colloquiumUpiId(): string {
  return (process.env.COLLOQUIUM_UPI_ID || "").trim();
}

export function colloquiumUpiName(): string {
  return (process.env.COLLOQUIUM_UPI_NAME || "DSSE IIT Bombay").trim();
}
