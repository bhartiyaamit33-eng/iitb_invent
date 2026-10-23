import type {
  ParticipationCategory,
  PlagiarismStatus,
  ReviewAssignmentStatus,
  ReviewDecision,
} from "@prisma/client";

export const REVIEW_DECISION_LABELS: Record<ReviewDecision, string> = {
  SHORTLIST_PAPER: "Shortlist as paper",
  SHORTLIST_POSTER: "Shortlist as poster",
  NOT_SELECTED: "Do not shortlist",
  NOT_MY_EXPERTISE: "Not my expertise",
};

export const PLAGIARISM_LABELS: Record<PlagiarismStatus, string> = {
  NOT_CHECKED: "Turnitin not checked",
  CLEAR: "Turnitin clear",
  FLAGGED: "Turnitin flagged",
};

const SHORTLIST_DECISIONS = new Set<ReviewDecision>([
  "SHORTLIST_PAPER",
  "SHORTLIST_POSTER",
]);

export function isReviewDecision(value: string): value is ReviewDecision {
  return (
    value === "SHORTLIST_PAPER" ||
    value === "SHORTLIST_POSTER" ||
    value === "NOT_SELECTED" ||
    value === "NOT_MY_EXPERTISE"
  );
}

export function isPlagiarismStatus(value: string): value is PlagiarismStatus {
  return value === "NOT_CHECKED" || value === "CLEAR" || value === "FLAGGED";
}

export function isOfficialShortlist(status: string): boolean {
  return status === "SHORTLISTED_PAPER" || status === "SHORTLISTED_POSTER";
}

type ReviewSlice = {
  status: ReviewAssignmentStatus;
  decision: ReviewDecision | null;
};

/** A finished review that asks the organisers to shortlist the submission. */
export function reviewerShortlisted(reviews: ReviewSlice[]): boolean {
  return reviews.some(
    (review) => review.status === "COMPLETED" && review.decision != null && SHORTLIST_DECISIONS.has(review.decision),
  );
}

/** Counts of finished reviewer decisions, for the admin shortlist queue. */
export function shortlistSummary(reviews: ReviewSlice[]): string | null {
  const done = reviews.filter((review) => review.status === "COMPLETED" && review.decision);
  if (done.length === 0) return null;
  const papers = done.filter((review) => review.decision === "SHORTLIST_PAPER").length;
  const posters = done.filter((review) => review.decision === "SHORTLIST_POSTER").length;
  const declined = done.filter((review) => review.decision === "NOT_SELECTED").length;
  const outside = done.filter((review) => review.decision === "NOT_MY_EXPERTISE").length;
  const parts: string[] = [];
  if (papers) parts.push(papers === 1 ? "1 shortlist as paper" : `${papers} shortlist as paper`);
  if (posters) parts.push(posters === 1 ? "1 shortlist as poster" : `${posters} shortlist as poster`);
  if (declined) parts.push(declined === 1 ? "1 does not shortlist" : `${declined} do not shortlist`);
  if (outside) parts.push(outside === 1 ? "1 not their expertise" : `${outside} not their expertise`);
  return parts.join(", ");
}

/**
 * Why an organiser cannot yet set Shortlisted: paper or Shortlisted: poster.
 * Attendee registrations skip this. Already-official shortlists are not re-checked here.
 */
export function officialShortlistBlock(opts: {
  participationCategory: ParticipationCategory;
  plagiarismStatus: PlagiarismStatus;
  reviews: ReviewSlice[];
}): string | null {
  if (opts.participationCategory === "ATTENDEE") return null;
  if (!reviewerShortlisted(opts.reviews)) {
    return "A reviewer has to shortlist this submission before it can be officially shortlisted. The author is not asked to pay until you confirm.";
  }
  if (opts.plagiarismStatus === "NOT_CHECKED") {
    return "Record the Turnitin check before officially shortlisting this submission.";
  }
  return null;
}

/** Submissions a reviewer has shortlisted that are still waiting for an official decision. */
export const reviewerShortlistView = {
  status: "RECEIVED" as const,
  participationCategory: { not: "ATTENDEE" as const },
  plagiarismStatus: "NOT_CHECKED" as const,
  reviews: {
    some: {
      status: "COMPLETED" as const,
      decision: { in: ["SHORTLIST_PAPER", "SHORTLIST_POSTER"] as const },
    },
  },
};

/** Reviewer shortlist plus a recorded Turnitin result, still not officially shortlisted. */
export const readyToConfirmView = {
  status: "RECEIVED" as const,
  participationCategory: { not: "ATTENDEE" as const },
  plagiarismStatus: { in: ["CLEAR", "FLAGGED"] as const },
  reviews: {
    some: {
      status: "COMPLETED" as const,
      decision: { in: ["SHORTLIST_PAPER", "SHORTLIST_POSTER"] as const },
    },
  },
};
