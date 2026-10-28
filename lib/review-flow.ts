import type {
  ParticipationCategory,
  PlagiarismStatus,
  ReviewAssignmentStatus,
  ReviewDecision,
  ReviewRecommendation,
} from "@prisma/client";

export const REVIEW_DECISION_LABELS: Record<ReviewDecision, string> = {
  SHORTLIST_PAPER: "Shortlist as paper",
  SHORTLIST_POSTER: "Shortlist as poster",
  NOT_SELECTED: "Do not shortlist",
  NOT_MY_EXPERTISE: "Not my expertise",
};

/** The recommendation list reviewers choose from. Not my expertise is a separate decision. */
export const REVIEW_RECOMMENDATION_LABELS: Record<ReviewRecommendation, string> = {
  STRONG_ACCEPT: "Strong accept",
  ACCEPT: "Accept",
  WEAK_ACCEPT: "Weak accept",
  BORDERLINE: "Borderline",
  WEAK_REJECT: "Weak reject",
  REJECT: "Reject",
};

/** Dropdown on the assigned-review form, in the order reviewers see it. */
export const REVIEW_FORM_CHOICES: { value: string; label: string }[] = [
  ...Object.entries(REVIEW_RECOMMENDATION_LABELS).map(([value, label]) => ({ value, label })),
  { value: "NOT_MY_EXPERTISE", label: REVIEW_DECISION_LABELS.NOT_MY_EXPERTISE },
];

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

export function isReviewRecommendation(value: string): value is ReviewRecommendation {
  return (
    value === "STRONG_ACCEPT" ||
    value === "ACCEPT" ||
    value === "WEAK_ACCEPT" ||
    value === "BORDERLINE" ||
    value === "WEAK_REJECT" ||
    value === "REJECT"
  );
}

/** A choice the review form can submit. Legacy shortlist decisions stay valid for older reviews. */
export function isReviewChoice(value: string): boolean {
  return value === "NOT_MY_EXPERTISE" || isReviewRecommendation(value) || isReviewDecision(value);
}

export function isPlagiarismStatus(value: string): value is PlagiarismStatus {
  return value === "NOT_CHECKED" || value === "CLEAR" || value === "FLAGGED";
}

export function isOfficialShortlist(status: string): boolean {
  return status === "SHORTLISTED_PAPER" || status === "SHORTLISTED_POSTER";
}

const ACCEPT_RECOMMENDATIONS = new Set<ReviewRecommendation>(["STRONG_ACCEPT", "ACCEPT"]);

type ReviewSlice = {
  status: ReviewAssignmentStatus;
  decision: ReviewDecision | null;
  recommendation?: ReviewRecommendation | null;
};

function recommendsAcceptance(review: ReviewSlice): boolean {
  return (
    (review.decision != null && SHORTLIST_DECISIONS.has(review.decision)) ||
    (review.recommendation != null && ACCEPT_RECOMMENDATIONS.has(review.recommendation))
  );
}

/** A finished review that asks the organisers to shortlist the submission. */
export function reviewerShortlisted(reviews: ReviewSlice[]): boolean {
  return reviews.some((review) => review.status === "COMPLETED" && recommendsAcceptance(review));
}

/** Counts of finished reviewer decisions, for the admin shortlist queue. */
export function shortlistSummary(reviews: ReviewSlice[]): string | null {
  const done = reviews.filter((review) => review.status === "COMPLETED");
  if (done.length === 0) return null;
  const parts: string[] = [];
  const push = (count: number, one: string, many: string) => {
    if (count === 1) parts.push(one);
    else if (count > 1) parts.push(`${count} ${many}`);
  };
  push(done.filter((review) => review.decision === "SHORTLIST_PAPER").length, "1 shortlist as paper", "shortlist as paper");
  push(done.filter((review) => review.decision === "SHORTLIST_POSTER").length, "1 shortlist as poster", "shortlist as poster");
  push(done.filter((review) => review.decision === "NOT_SELECTED").length, "1 does not shortlist", "do not shortlist");
  push(done.filter((review) => review.recommendation === "STRONG_ACCEPT").length, "1 strong accept", "strong accept");
  push(done.filter((review) => review.recommendation === "ACCEPT").length, "1 accept", "accept");
  push(done.filter((review) => review.recommendation === "WEAK_ACCEPT").length, "1 weak accept", "weak accept");
  push(done.filter((review) => review.recommendation === "BORDERLINE").length, "1 borderline", "borderline");
  push(done.filter((review) => review.recommendation === "WEAK_REJECT").length, "1 weak reject", "weak reject");
  push(done.filter((review) => review.recommendation === "REJECT").length, "1 reject", "reject");
  push(done.filter((review) => review.decision === "NOT_MY_EXPERTISE").length, "1 not their expertise", "not their expertise");
  return parts.length ? parts.join(", ") : null;
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
    return "A reviewer has to recommend acceptance before this can be officially shortlisted. Strong accept or Accept counts. Not my expertise does not. The author is not asked to pay until you confirm.";
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
      OR: [
        { decision: { in: ["SHORTLIST_PAPER", "SHORTLIST_POSTER"] as ReviewDecision[] } },
        { recommendation: { in: ["STRONG_ACCEPT", "ACCEPT"] as ReviewRecommendation[] } },
      ],
    },
  },
};

/** Reviewer acceptance plus a recorded Turnitin result, still not officially shortlisted. */
export const readyToConfirmView = {
  status: "RECEIVED" as const,
  participationCategory: { not: "ATTENDEE" as const },
  plagiarismStatus: { in: ["CLEAR", "FLAGGED"] as PlagiarismStatus[] },
  reviews: {
    some: {
      status: "COMPLETED" as const,
      OR: [
        { decision: { in: ["SHORTLIST_PAPER", "SHORTLIST_POSTER"] as ReviewDecision[] } },
        { recommendation: { in: ["STRONG_ACCEPT", "ACCEPT"] as ReviewRecommendation[] } },
      ],
    },
  },
};
