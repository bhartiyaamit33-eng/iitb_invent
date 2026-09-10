import type { TimelineItem } from "@/lib/landing";

export const CFP_KICKER = "Call for Research Papers";
export const CFP_TITLE = "IITB INV.ENT Conference";
export const CFP_TAGLINE =
  "Where Entrepreneurship Research Meets Venture Practice";

export const CFP_INTRO = [
  "IITB INV.ENT invites emerging scholars and researchers to submit their work for presentation at a conference bringing together rigorous entrepreneurship research and venture practice.",
  "The conference aims to create a platform for researchers to present new ideas, receive scholarly feedback, build collaborations, and contribute to the growing body of knowledge in entrepreneurship and innovation.",
  "This conference is a part of a 2 day INV.ENT Event by DSSE, IIT Bombay where entrepreneurship researchers, startup founders, VCs, and other stakeholders in the entrepreneurship ecosystem come together.",
] as const;

export const CFP_PRESENTATION_DATE = "31 January 2027";
export const CFP_VENUE = "IIT Bombay, Mumbai";
export const CFP_DEADLINE = "15 October 2026";
export const CFP_ABSTRACT_WORDS = 1500;

export const CFP_WHO = [
  {
    title: "PhD Scholars",
    body: "Doctoral researchers working on entrepreneurship, innovation, and related questions.",
  },
  {
    title: "Postdoctoral Scholars",
    body: "Postdoctoral researchers building a research agenda in entrepreneurship and innovation.",
  },
  {
    title: "Early-Career Faculty / Professors",
    body: "Faculty in the early stages of their academic career who want scholarly feedback and collaborators.",
  },
] as const;

export const CFP_DATES: Omit<TimelineItem, "state">[] = [
  {
    id: "abstract",
    kicker: "Extended abstract deadline",
    date: "15 Oct 2026",
    at: "2026-10-15",
  },
  {
    id: "result",
    kicker: "Result announcement",
    date: "15 Nov 2026",
    at: "2026-11-15",
  },
  {
    id: "final",
    kicker: "Final paper submission",
    date: "1 Jan 2027",
    at: "2027-01-01",
  },
  {
    id: "workshop",
    kicker: "Pre-conference workshop",
    date: "30 Jan 2027",
    at: "2027-01-30",
  },
  {
    id: "conference",
    kicker: "Conference & presentations",
    date: "31 Jan 2027",
    at: "2027-01-31",
  },
];

export const CFP_HIGHLIGHTS = [
  {
    title: "Research Paper Presentations",
    body: "A panel of eminent entrepreneurship scholars will select 30 research papers for oral presentation at IITB INV.ENT. Each selected researcher will be given 10 minutes for presentation + 5 minutes for Q&A.",
  },
  {
    title: "Poster Presentations",
    body: "An additional 30 submissions will be selected for poster presentations, providing researchers another opportunity to showcase their work and engage with conference participants.",
  },
  {
    title: "Awards",
    body: "Best Paper Award — ₹25,000. Best Poster Award — ₹10,000.",
  },
  {
    title: "Stay at IIT Bombay",
    body: "Shared limited accommodation will be available at the IIT Bombay Guest House on a first-come, first-served basis (costs to be borne by the participants).",
  },
] as const;

export const CFP_GUIDELINE_POINTS = [
  "Research Objectives",
  "Methodology",
  "Initial / Preliminary Findings",
] as const;

export const CFP_AI_POLICY =
  "Use of AI for preparing the submitted research abstract will attract automatic rejection.";

export const CFP_AREAS = [
  "Elements of the Entrepreneurship Ecosystem",
  "Entrepreneurial Behaviour and Ethics",
  "Inclusive Innovation & Social Entrepreneurship",
  "Indigenous and Rural Entrepreneurship",
  "Innovation and Product Development",
  "Lab-to-Market Translation",
  "University Entrepreneurship & Entrepreneurship Education",
  "AI & Entrepreneurship",
  "Entrepreneurial Finance",
  "Any other research topic related to entrepreneurship",
] as const;

export const CFP_SELECTION = [
  "All eligible submissions will be reviewed by a panel of eminent entrepreneurship scholars.",
  "From the applications received, submissions will be selected for Research Paper Presentations and additional submissions will be selected for Poster Presentations.",
  "Selections will be based on the quality, relevance, originality, and potential contribution of the proposed research to the field of entrepreneurship and innovation.",
] as const;

export const CFP_CLOSE_HEADING = "Connect. Collaborate. Contribute.";
export const CFP_CLOSE_BODY =
  "Join us at IITB INV.ENT to exchange ideas, engage with fellow researchers, and contribute to the future of entrepreneurship and innovation research.";
