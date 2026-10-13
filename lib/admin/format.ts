import type {
  ApplicationPaymentStatus,
  ApplicationStatus,
  GatewayPayment,
} from "@prisma/client";
import { paymentStatusLabel } from "@/lib/conference";

/** Badge tones. Colour always travels with a text label, never alone. */
export type Tone = "good" | "warn" | "bad" | "info" | "neutral";

export function applicationTone(status: ApplicationStatus): Tone {
  switch (status) {
    case "SHORTLISTED_PAPER":
    case "SHORTLISTED_POSTER":
    case "ATTENDEE":
      return "info";
    case "WAITLISTED":
      return "warn";
    default:
      return "neutral";
  }
}

export function paymentTone(status: ApplicationPaymentStatus): Tone {
  switch (status) {
    case "PAID":
    case "WAIVED":
      return "good";
    case "UNPAID":
    case "REPORTED":
      return "warn";
    default:
      return "neutral";
  }
}

export function gatewayTone(p: Pick<GatewayPayment, "verified" | "imtStatus">): Tone {
  if (p.verified) return "good";
  if (p.imtStatus === "S" || p.imtStatus === "DIRECT_RECON") return "warn";
  if (p.imtStatus === "F") return "bad";
  return "neutral";
}

const IST = "Asia/Kolkata";

export function istDateTime(d: Date): string {
  return d.toLocaleString("en-IN", {
    timeZone: IST,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function istDate(d: Date): string {
  return d.toLocaleDateString("en-IN", { timeZone: IST, day: "numeric", month: "short", year: "numeric" });
}

export function istTime(d: Date): string {
  return d.toLocaleTimeString("en-IN", { timeZone: IST, hour: "numeric", minute: "2-digit" });
}

export function istDayHeading(d: Date): string {
  return d.toLocaleDateString("en-IN", { timeZone: IST, weekday: "long", day: "numeric", month: "long" });
}

/** "1 application", "3 applications". */
export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n.toLocaleString("en-IN")} ${n === 1 ? one : many}`;
}

/** "once", "twice", "3 times". */
export function times(n: number): string {
  if (n === 1) return "once";
  if (n === 2) return "twice";
  return `${n.toLocaleString("en-IN")} times`;
}

/**
 * Fee status as organisers read it. Before a decision a presenter (or an
 * attendee from before attendees paid at registration) owes nothing yet, so
 * "Not required" is kept for closed registrations only.
 */
export function feeStatusLabel(app: {
  status: ApplicationStatus;
  paymentStatus: ApplicationPaymentStatus;
}): string {
  if (app.paymentStatus === "NOT_REQUIRED" && (app.status === "RECEIVED" || app.status === "WAITLISTED")) {
    return "Due once selected";
  }
  return paymentStatusLabel(app.paymentStatus);
}
