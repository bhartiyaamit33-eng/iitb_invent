import type {
  ApplicationPaymentStatus,
  ApplicationStatus,
  ParticipationCategory,
  PhdYear,
  PostdocSeeking,
  ProfessionalCategory,
} from "@prisma/client";

export type {
  ApplicationPaymentStatus,
  ApplicationStatus,
  ParticipationCategory,
  PhdYear,
  PostdocSeeking,
  ProfessionalCategory,
};

export const MAX_ABSTRACT_BYTES = 10 * 1024 * 1024;

export const PROFESSIONAL_OPTIONS: {
  value: ProfessionalCategory;
  label: string;
}[] = [
  { value: "PHD_SCHOLAR", label: "PhD Scholar" },
  { value: "POSTDOC", label: "Post-doctoral Researcher" },
  { value: "PROFESSOR", label: "Professor" },
  { value: "INDUSTRY", label: "Industry Researcher/Professional" },
  { value: "OTHER", label: "Other" },
];

export const PHD_YEAR_OPTIONS: { value: PhdYear; label: string }[] = [
  { value: "YEARS_1_3", label: "1–3" },
  { value: "YEARS_4_5", label: "4–5" },
  { value: "YEAR_6_PLUS", label: "6th year or above" },
  { value: "THESIS_SUBMITTED", label: "Thesis submitted" },
];

export const POSTDOC_OPTIONS: { value: PostdocSeeking; label: string }[] = [
  { value: "YES", label: "Yes" },
  { value: "NO", label: "No" },
  { value: "MAYBE", label: "Maybe" },
];

export const PARTICIPATION_OPTIONS: {
  value: ParticipationCategory;
  label: string;
  hint?: string;
}[] = [
  { value: "PAPER_ONLY", label: "Paper Presentation Only" },
  {
    value: "PAPER_OR_POSTER",
    label: "Paper or Poster Presentations",
    hint: "Priority given to paper; if the paper is not shortlisted, you will be considered for poster.",
  },
  { value: "POSTER_ONLY", label: "Poster Presentation only" },
  { value: "ATTENDEE", label: "Attendee" },
  { value: "OTHER", label: "Other" },
];

export const APPLICATION_STATUS_OPTIONS: {
  value: ApplicationStatus;
  label: string;
}[] = [
  { value: "RECEIVED", label: "Received" },
  { value: "SHORTLISTED_PAPER", label: "Shortlisted — paper" },
  { value: "SHORTLISTED_POSTER", label: "Shortlisted — poster" },
  { value: "ATTENDEE", label: "Attendee" },
  { value: "WAITLISTED", label: "Waitlisted" },
  { value: "REJECTED", label: "Not selected" },
  { value: "WITHDRAWN", label: "Withdrawn" },
];

export const PAYMENT_STATUS_OPTIONS: {
  value: ApplicationPaymentStatus;
  label: string;
}[] = [
  { value: "NOT_REQUIRED", label: "Not required" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "REPORTED", label: "Reported — confirm" },
  { value: "PAID", label: "Paid" },
  { value: "WAIVED", label: "Waived" },
];

export const DEFAULT_CONFERENCE_FEE_PAISE = 300_000;

export function professionalLabel(
  value: ProfessionalCategory,
  other?: string | null,
): string {
  if (value === "OTHER") {
    return other?.trim() ? `Other: ${other.trim()}` : "Other";
  }
  return PROFESSIONAL_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function phdYearLabel(value: PhdYear | null | undefined): string {
  if (!value) return "—";
  return PHD_YEAR_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function postdocLabel(value: PostdocSeeking | null | undefined): string {
  if (!value) return "—";
  return POSTDOC_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function participationLabel(
  value: ParticipationCategory,
  other?: string | null,
): string {
  if (value === "OTHER") {
    return other?.trim() ? `Other: ${other.trim()}` : "Other";
  }
  return PARTICIPATION_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function applicationStatusLabel(value: ApplicationStatus): string {
  return APPLICATION_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function needsAbstract(cat: ParticipationCategory): boolean {
  return (
    cat === "PAPER_ONLY" ||
    cat === "PAPER_OR_POSTER" ||
    cat === "POSTER_ONLY"
  );
}

const PROFESSIONAL = new Set<ProfessionalCategory>(
  PROFESSIONAL_OPTIONS.map((o) => o.value),
);
const PHD_YEAR = new Set<PhdYear>(PHD_YEAR_OPTIONS.map((o) => o.value));
const POSTDOC = new Set<PostdocSeeking>(POSTDOC_OPTIONS.map((o) => o.value));
const PARTICIPATION = new Set<ParticipationCategory>(
  PARTICIPATION_OPTIONS.map((o) => o.value),
);
const APP_STATUS = new Set<ApplicationStatus>(
  APPLICATION_STATUS_OPTIONS.map((o) => o.value),
);

export function parseProfessional(
  raw: string,
): ProfessionalCategory | null {
  return PROFESSIONAL.has(raw as ProfessionalCategory)
    ? (raw as ProfessionalCategory)
    : null;
}

export function parsePhdYear(raw: string): PhdYear | null {
  if (!raw) return null;
  return PHD_YEAR.has(raw as PhdYear) ? (raw as PhdYear) : null;
}

export function parsePostdoc(raw: string): PostdocSeeking | null {
  if (!raw) return null;
  return POSTDOC.has(raw as PostdocSeeking) ? (raw as PostdocSeeking) : null;
}

export function parseParticipation(
  raw: string,
): ParticipationCategory | null {
  return PARTICIPATION.has(raw as ParticipationCategory)
    ? (raw as ParticipationCategory)
    : null;
}

export function parseApplicationStatus(
  raw: string,
): ApplicationStatus | null {
  return APP_STATUS.has(raw as ApplicationStatus)
    ? (raw as ApplicationStatus)
    : null;
}

const APP_PAYMENT = new Set<ApplicationPaymentStatus>(
  PAYMENT_STATUS_OPTIONS.map((o) => o.value),
);

export function parsePaymentStatus(
  raw: string,
): ApplicationPaymentStatus | null {
  return APP_PAYMENT.has(raw as ApplicationPaymentStatus)
    ? (raw as ApplicationPaymentStatus)
    : null;
}

export function paymentStatusLabel(
  value: ApplicationPaymentStatus,
): string {
  return PAYMENT_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

/** PhD year only applies to current PhD scholars. */
export function needsPhdYear(cat: ProfessionalCategory): boolean {
  return cat === "PHD_SCHOLAR";
}

/** Selected to attend / present — they owe the registration fee. */
export function statusRequiresPayment(status: ApplicationStatus): boolean {
  return (
    status === "SHORTLISTED_PAPER" ||
    status === "SHORTLISTED_POSTER" ||
    status === "ATTENDEE"
  );
}

export function formatInrFromPaise(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export function defaultStatusEmailMessage(status: ApplicationStatus): string {
  switch (status) {
    case "SHORTLISTED_PAPER":
      return "Congratulations — you have been shortlisted to present a paper at the Entrepreneurship Research Conference during Inv.ent 2027 at IIT Bombay.";
    case "SHORTLISTED_POSTER":
      return "Congratulations — you have been shortlisted for a poster presentation at the Entrepreneurship Research Conference during Inv.ent 2027 at IIT Bombay.";
    case "ATTENDEE":
      return "You are confirmed as an attendee at the Entrepreneurship Research Conference during Inv.ent 2027 at IIT Bombay.";
    case "WAITLISTED":
      return "Thank you for applying. You are on the waitlist for the Entrepreneurship Research Conference. We will write again if a place opens.";
    case "REJECTED":
      return "Thank you for applying to the Entrepreneurship Research Conference. We are unable to offer a place this year, and we hope to see you at Inv.ent.";
    case "WITHDRAWN":
      return "Your conference application has been marked as withdrawn. Write to support@iitbinvent.com if this is unexpected.";
    default:
      return "We have updated the status of your application for the Entrepreneurship Research Conference at Inv.ent 2027.";
  }
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

export function isPdfBuffer(bytes: Buffer): boolean {
  return bytes.subarray(0, 5).toString("ascii") === "%PDF-";
}
