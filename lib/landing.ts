export type HeroVariant = "photo" | "plain";

export type LandingFaq = { question: string; answer: string };
export type LandingStat = { label: string; value: string };

export type LiveStripData = {
  clock: string;
  happening: { title: string; room: string | null }[];
  upNext: { title: string; when: string }[];
};

export type TimelineState = "past" | "now" | "next";

export type TimelineItem = {
  id: string;
  kicker: string;
  date: string;
  at: string;
  state: TimelineState;
};

export type LandingThemeName = "dark" | "light";

export type LandingProps = {
  heroVariant: HeroVariant;
  signedInName: string | null;
  live: LiveStripData | null;
  faqs: LandingFaq[];
  stats: LandingStat[];
  timeline: TimelineItem[];
  theme?: LandingThemeName;
};

export const TAGLINE = "Entrepreneurship Research and Venture Practice Conference";
export const TAGLINE_LEAD = "Entrepreneurship Research and Venture Practice";
export const TAGLINE_REST = "Conference";

export const SUBMIT_HREF = "/conference#submit";
export const REGISTER_HREF = "/signup";

export const KEY_DATES: Omit<TimelineItem, "state">[] = [
  {
    id: "open",
    kicker: "Submissions open",
    date: "10 Sep 2026",
    at: "2026-09-10",
  },
  {
    id: "deadline",
    kicker: "Submission deadline",
    date: "15 Oct 2026",
    at: "2026-10-15",
  },
  {
    id: "accept",
    kicker: "Acceptance",
    date: "31 Dec 2026",
    at: "2026-12-31",
  },
  {
    id: "day-zero",
    kicker: "Day Zero",
    date: "30 Jan 2027",
    at: "2027-01-30",
  },
  {
    id: "conference",
    kicker: "Conference",
    date: "31 Jan 2027",
    at: "2027-01-31",
  },
];

export function markTimeline(
  items: Omit<TimelineItem, "state">[],
  now = new Date(),
): TimelineItem[] {
  let current = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item) continue;
    const start = new Date(`${item.at}T00:00:00+05:30`);
    if (now >= start) current = i;
  }
  return items.map((item, i) => ({
    ...item,
    state: i < current ? "past" : i === current ? "now" : "next",
  }));
}

export const FALLBACK_STATS: LandingStat[] = [
  { value: "2014", label: "Board of Governors approved the centre." },
  { value: "5550+", label: "Students through entrepreneurship courses." },
  { value: "1470+", label: "Ventures mentored across cohorts." },
  { value: "670+", label: "Startups touched by the DSSE stack." },
];

export const FALLBACK_FAQS: LandingFaq[] = [
  {
    question: "When is INV.ENT 2027?",
    answer:
      "30 and 31 January 2027, Asia/Kolkata, at the DSSE Building, IIT Bombay. 30 January is Day Zero. 31 January is the conference day.",
  },
  {
    question: "Where is the venue?",
    answer:
      "Desai Sethi School of Entrepreneurship · DSSE Building · IIT Bombay · Powai, Mumbai 400076.",
  },
  {
    question: "How do I submit an abstract?",
    answer:
      "Create a free account, then open Papers, posters & workshops in the dashboard. Organisers review submissions and email a payment link if accepted.",
  },
  {
    question: "How do I register to attend?",
    answer:
      "Create an account via Sign up. Completing your profile is optional but helps other attendees find you in the directory.",
  },
];

export const PARTICIPATE = [
  {
    title: "Research Papers",
    href: "/submit",
    icon: "paper" as const,
    body: "Peer sessions where labs show work that can leave the building: methods, evidence, and a concrete next step.",
  },
  {
    title: "Poster Presentations",
    href: "/submit",
    icon: "poster" as const,
    body: "Corridor conversations with the work on the wall. The format for early results, prototypes, and precise questions.",
  },
  {
    title: "Startup Showcases",
    href: "/ventures?kind=STARTUP",
    icon: "startup" as const,
    body: "Registered or shipping ventures. Logo, tagline, and an in-site preview before anyone clicks out.",
  },
  {
    title: "Innovation Demos",
    href: "/ventures?kind=PROJECT",
    icon: "demo" as const,
    body: "Lab builds, campus products, and hardware on a table. Read the story first, then open the link if you want more.",
  },
  {
    title: "Case Studies",
    href: "/submit",
    icon: "case" as const,
    body: "Practice as evidence: what shipped, what stalled, and what another founder should copy or avoid.",
  },
];

export const AGENDA = [
  {
    time: "0900",
    title: "Open & badge",
    body: "Check in with your ticket QR. Meet people before the first talk. Directory profiles make names stick.",
  },
  {
    time: "AM",
    title: "Speakers & research",
    body: "Keynotes and panels from faculty and operators. Poster presentations where labs show work that can leave the building.",
  },
  {
    time: "PM",
    title: "Pitches & ventures",
    body: "Idea pitching and venture presentations: short, concrete asks. See who is pitching next on the live programme.",
  },
  {
    time: "to 1930",
    title: "Connect & close",
    body: "Office hours, hallway intros, LinkedIn connects. The day ends ~7:30 pm IST; the attendee network does not.",
  },
];

export const VENTURE_KINDS = [
  {
    href: "/ventures?kind=STARTUP",
    title: "Startups",
    body: "Registered or shipping ventures. Custom logo or initials, tagline, and in-site preview before you click out.",
  },
  {
    href: "/ventures?kind=PROJECT",
    title: "Projects",
    body: "Lab builds, prototypes, and campus products. Read the story first, then open the link if you want more.",
  },
  {
    href: "/ventures?kind=IDEA",
    title: "Ideas",
    body: "Early concepts looking for co-founders, mentors, or a first customer. Explore the directory and connect.",
  },
];

export const IMAGES = {
  hero: {
    src: "/assets/dsse-building.jpg",
    alt: "Desai Sethi School of Entrepreneurship building at IIT Bombay",
  },
  campus: {
    src: "/assets/dsse-building.jpg",
    alt: "Desai Sethi School of Entrepreneurship building at IIT Bombay",
  },
  research: {
    src: "/assets/landing/poster-session.jpg",
    alt: "Researchers discussing incubation and venture-capital posters at DSSE",
  },
  workshop: {
    src: "/assets/landing/poster-demo.jpg",
    alt: "A presenter walking a faculty member through a social-innovation poster",
  },
  speaker: {
    src: "/assets/landing/panel-talk.jpg",
    alt: "Faculty in conversation on the DSSE symposium stage",
  },
  networking: {
    src: "/assets/landing/poster-corridor.jpg",
    alt: "Delegates talking along the poster corridor at DSSE",
  },
  welcome: {
    src: "/assets/landing/stage-welcome.jpg",
    alt: "Guests welcomed on the Entrepreneurship Research Symposium stage",
  },
  panel: {
    src: "/assets/landing/panel-session.jpg",
    alt: "Panel on entrepreneurship education at DSSE",
  },
  handshake: {
    src: "/assets/landing/handshake.jpg",
    alt: "Speakers greeted on the DSSE stage",
  },
  faculty: {
    src: "/assets/landing/symposium-group.jpg",
    alt: "The DSSE team on stage at the Entrepreneurship Research Symposium, IIT Bombay",
  },
} as const;

/** Event-lane photographs from the DSSE symposium (not used behind hero type). */
export const GALLERY = [
  { src: "/assets/landing/poster-session.jpg", alt: "Poster session" },
  { src: "/assets/landing/poster-corridor.jpg", alt: "Poster corridor" },
  { src: "/assets/landing/poster-demo.jpg", alt: "Poster presentation" },
  { src: "/assets/landing/stage-welcome.jpg", alt: "Stage welcome" },
  { src: "/assets/landing/panel-talk.jpg", alt: "Panel discussion" },
  { src: "/assets/landing/panel-session.jpg", alt: "Education panel" },
  { src: "/assets/landing/handshake.jpg", alt: "Stage greeting" },
  { src: "/assets/landing/panel-seated.jpg", alt: "Seated panellists" },
  { src: "/assets/landing/faculty-lineup.jpg", alt: "Faculty lineup" },
  { src: "/assets/landing/symposium-group.jpg", alt: "Symposium group" },
] as const;

export const GALLERY_LANE_A = GALLERY.filter((_, i) => i % 2 === 0);
export const GALLERY_LANE_B = GALLERY.filter((_, i) => i % 2 === 1);
