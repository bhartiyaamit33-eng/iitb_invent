import {
  PayerCategory,
  PaymentStatus,
  SubmissionKind,
  SubmissionStatus,
} from "@prisma/client";

/** Registration fee (INR) by who is paying. */
export const FEE_INR: Record<PayerCategory, number> = {
  STUDENT: 5000,
  FACULTY: 10000,
  CORPORATE: 15000,
};

export function feeFor(category: PayerCategory): number {
  return FEE_INR[category];
}

export function formatInr(amount: number | string): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return String(amount);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);
}

export const KIND_LABEL: Record<SubmissionKind, string> = {
  PAPER: "Paper presentation",
  POSTER: "Poster presentation",
  WORKSHOP: "Workshop",
};

export const CATEGORY_LABEL: Record<PayerCategory, string> = {
  STUDENT: "Student",
  FACULTY: "Faculty",
  CORPORATE: "Corporate / industry",
};

export const SUBMISSION_STATUS_LABEL: Record<SubmissionStatus, string> = {
  SUBMITTED: "Awaiting review",
  APPROVED: "Accepted",
  REJECTED: "Not accepted",
  WITHDRAWN: "Withdrawn",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: "Awaiting payment",
  IN_FLIGHT: "Payment in progress",
  SUCCESS: "Paid (awaiting settlement)",
  FAILED: "Payment failed",
  SETTLED: "Settled to IITB account",
  REFUNDED: "Refunded / chargeback",
};

export function isPaidStatus(status: PaymentStatus): boolean {
  return status === "SUCCESS" || status === "SETTLED";
}

export function parsePayerCategory(raw: string): PayerCategory | null {
  if (raw === "STUDENT" || raw === "FACULTY" || raw === "CORPORATE") return raw;
  return null;
}

export function parseSubmissionKind(raw: string): SubmissionKind | null {
  if (raw === "PAPER" || raw === "POSTER" || raw === "WORKSHOP") return raw;
  return null;
}

export function amountsMatch(
  stored: number | string,
  incoming: string,
): boolean {
  const a = Number(stored);
  const b = Number(incoming);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return Math.abs(a - b) < 0.005;
}
