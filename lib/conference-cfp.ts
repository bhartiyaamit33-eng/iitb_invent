/**
 * Call for Papers copy, shown on /research. The Call for Papers artwork wins
 * where drafts disagree. Dates live in KEY_DATES (lib/landing.ts) so the
 * landing page and this page cannot drift apart.
 */

export const CFP_OVERVIEW =
  "IITB INV.ENT is an entrepreneurship research and practice conference conducted by the Desai Sethi School of Entrepreneurship, IIT Bombay. People meet, network, attend sessions, workshops, and events, get exposure to research across the entrepreneurship ecosystem, and hear talks on entrepreneurship in practice. Emerging scholars are invited to submit work for presentation. Conference dates: 30-31 January 2027.";

export const CFP_APPLICANTS = [
  { id: "phd", label: "PhD Scholars" },
  { id: "postdoc", label: "Postdoctoral Scholars" },
  { id: "faculty", label: "Early-Career Faculty / Professors" },
] as const;

export const CFP_GUIDELINE_POINTS = [
  "Research objectives",
  "Methodology",
  "Initial / preliminary findings",
] as const;

export const CFP_AI_CALLOUT =
  "Disclaimer: Use of AI to prepare the submitted research abstract will attract automatic rejection.";

export const CFP_RESEARCH_AREAS = [
  "Elements of the entrepreneurship ecosystem",
  "Entrepreneurial behaviour and ethics",
  "Inclusive innovation & social entrepreneurship",
  "Indigenous and rural entrepreneurship",
  "Innovation and product development",
  "Lab-to-market translation",
  "University entrepreneurship & education",
  "AI & entrepreneurship",
  "Entrepreneurial finance",
  "Any other topic related to entrepreneurship",
] as const;

export const CFP_SELECTION = [
  {
    n: "1",
    title: "Review",
    body: "Every eligible submission is reviewed by a panel of eminent entrepreneurship scholars.",
  },
  {
    n: "2",
    title: "Selection",
    body: "Papers are selected for research presentations, and a further set for poster presentations. The registration fee and payment link are sent only after this decision.",
  },
  {
    n: "3",
    title: "Criteria",
    body: "Based on quality, relevance, originality, and potential contribution to the field.",
  },
] as const;
