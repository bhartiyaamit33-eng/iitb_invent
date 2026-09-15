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

export type LandingProps = {
  heroVariant: HeroVariant;
  signedInName: string | null;
  live: LiveStripData | null;
  faqs: LandingFaq[];
  stats: LandingStat[];
  timeline: TimelineItem[];
};

export const TAGLINE = "Entrepreneurship Research and Venture Practice Conference";
export const TAGLINE_LEAD = "Entrepreneurship Research and Venture Practice";
export const TAGLINE_REST = "Conference";

export const SUBMIT_HREF = "/conference#submit";
export const LOGIN_TO_SUBMIT_HREF = `/login?callbackUrl=${encodeURIComponent("/conference#submit")}`;
export const REGISTER_HREF = "/login";

export function submitHrefFor(signedIn: boolean) {
  return signedIn ? SUBMIT_HREF : LOGIN_TO_SUBMIT_HREF;
}

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
    id: "conference",
    kicker: "Conference",
    date: "30-31 Jan 2027",
    at: "2027-01-30",
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
    question: "When is IITB INV.ENT 2027?",
    answer:
      "30-31 January 2027, Asia/Kolkata, at the DSSE Building, IIT Bombay.",
  },
  {
    question: "Where is the venue?",
    answer:
      "Desai Sethi School of Entrepreneurship · DSSE Building · IIT Bombay · Powai, Mumbai 400076.",
  },
  {
    question: "How do I submit an abstract?",
    answer:
      "Log in (or create an account), then submit your paper or poster abstract on the conference page. Organisers review submissions and write to you with next steps. An account is not a ticket.",
  },
  {
    question: "How do I get a ticket?",
    answer:
      "Submit an abstract or register your interest in attending. Organisers review applications and write to you with next steps. The ticket appears on your dashboard and in email only after you are confirmed.",
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
    body: "Doors open. Confirmed attendees who have paid check in with their ticket QR.",
  },
  {
    time: "AM",
    title: "Speakers & research",
    body: "Keynotes and panels from faculty and operators. Poster presentations where labs show work that can leave the building.",
  },
  {
    time: "PM",
    title: "Sessions & workshops",
    body: "Talks and workshops on entrepreneurship research and venture practice.",
  },
  {
    time: "to 1930",
    title: "Connect & close",
    body: "Office hours and hallway intros. The day ends around 7:30 pm IST.",
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
