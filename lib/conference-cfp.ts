/** Final Call for Papers copy for /conference. Poster / Figma desktop wins where drafts disagree. */

export const CFP_OVERVIEW_BEFORE =
  " invites emerging scholars and researchers to submit their work for presentation at a conference bringing together rigorous ";

export const CFP_OVERVIEW_AFTER =
  ". The conference gives researchers a platform to present new ideas, receive scholarly feedback, build collaborations, and contribute to the growing body of knowledge in entrepreneurship and innovation. It is part of a two-day INV.ENT event by DS School of Entrepreneurship, IIT Bombay, where entrepreneurship researchers, startup founders, VCs, and other ecosystem stakeholders come together.";

export const CFP_META = [
  { label: "Presentation date", value: "31 January 2027" },
  { label: "Venue", value: "IIT Bombay, Mumbai" },
  { label: "Abstract deadline", value: "15 October 2026" },
] as const;

export const CFP_TRACKS = [
  { id: "paper", label: "Research Paper", icon: "/assets/cfp/icon-paper.svg" },
  { id: "poster", label: "Poster Presentation", icon: "/assets/cfp/icon-poster.svg" },
] as const;

export const CFP_APPLICANTS = [
  {
    id: "phd",
    label: "PhD Scholars",
    icon: "/assets/cfp/icon-scholar.svg",
  },
  {
    id: "postdoc",
    label: "Postdoctoral Scholars",
    icon: "/assets/cfp/icon-postdoc.svg",
  },
  {
    id: "faculty",
    label: "Early-Career Faculty / Professors",
    icon: "/assets/cfp/icon-faculty.svg",
  },
] as const;

export const CFP_TIMELINE = [
  {
    id: "abstract",
    kicker: "Abstract submission deadline",
    date: "15 Oct 2026",
  },
  {
    id: "accept",
    kicker: "Acceptance announcement",
    date: "15 Nov 2026",
  },
  {
    id: "final",
    kicker: "Final paper submissions",
    date: "1 Jan 2027",
  },
  {
    id: "conference",
    kicker: "Conference & workshops",
    date: "30–31 Jan 2027",
  },
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
    body: "Papers are selected for research presentations, and a further set for poster presentations.",
  },
  {
    n: "3",
    title: "Criteria",
    body: "Based on quality, relevance, originality, and potential contribution to the field.",
  },
] as const;

export const CFP_STAY =
  "Shared, limited accommodation is available at the IIT Bombay guest house, first-come first-served. Costs are borne by participants.";
