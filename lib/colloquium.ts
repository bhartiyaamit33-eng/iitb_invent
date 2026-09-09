import type {
  ApplicationStatus,
  ParticipationCategory,
  PhdYear,
  PostdocSeeking,
  ProfessionalCategory,
} from "@prisma/client";

export type {
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
