/**
 * Public-site content for the editorial redesign.
 *
 * Everything an organiser is likely to change between editions lives here so
 * the page components stay layout-only: navigation, sponsor and partner
 * rosters, partner journals, research tracks, accommodation and contact.
 */

export const EVENT_DATES = "30–31 January 2027";
export const EVENT_DATES_SHORT = "30–31 JAN 2027";
export const EVENT_VENUE = "IIT Bombay";
export const SUPPORT_EMAIL = "support@iitbinvent.com";
export const CONFERENCE_EMAIL = "conference@iitbinvent.com";
export const VENUE_LINES = [
  "Desai Sethi School of Entrepreneurship",
  "DSSE Building",
  "IIT Bombay",
  "Powai, Mumbai 400076",
] as const;

export type NavItem = { href: string; label: string };

/** Primary navbar. Every entry resolves to a real page. */
export const SITE_NAV: NavItem[] = [
  { href: "/about", label: "About" },
  { href: "/programme", label: "Programme" },
  { href: "/speakers", label: "Speakers" },
  { href: "/research", label: "Research" },
  { href: "/workshop", label: "Workshop" },
  { href: "/accommodation", label: "Accommodation" },
  { href: "/contact", label: "Contact" },
];

export const FOOTER_POLICY_NAV: NavItem[] = [
  { href: "/research", label: "Call for papers" },
  { href: "/workshop", label: "Workshop" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/faq", label: "FAQ" },
  { href: "/travel", label: "Travel" },
  { href: "/privacy", label: "Privacy" },
  { href: "/code-of-conduct", label: "Code of conduct" },
];

/* ── Sponsors and partners ───────────────────────────────────────────────── */

export type OrgTier = "sponsor" | "partner" | "host";

export type SiteOrg = {
  id: string;
  name: string;
  /** Short line under the name, e.g. "Title sponsor". */
  role: string;
  tier: OrgTier;
  /** Optional path under /public. When absent the name is set in serif. */
  logo?: string;
  href?: string;
};

/**
 * Logos drop in by adding `logo: "/assets/partners/<file>.png"`. Until then a
 * plate renders the name as a serif wordmark, so the band never shows a gap.
 */
export const SPONSORS: SiteOrg[] = [
  {
    id: "grey-labs-ai",
    name: "Grey Labs AI",
    role: "Sponsor",
    tier: "sponsor",
  },
];

export const PARTNERS: SiteOrg[] = [
  {
    id: "service-setu-academics",
    name: "Service Setu Academics",
    role: "Academic partner",
    tier: "partner",
  },
  {
    id: "iit-kanpur",
    name: "IIT Kanpur",
    role: "Institutional partner",
    tier: "partner",
  },
  {
    id: "iit-kharagpur",
    name: "IIT Kharagpur",
    role: "Institutional partner",
    tier: "partner",
  },
];

export const HOSTS: SiteOrg[] = [
  {
    id: "dsse",
    name: "Desai Sethi School of Entrepreneurship",
    role: "Host",
    tier: "host",
    logo: "/assets/dsse-wordmark.png",
    href: "https://www.dsse.iitb.ac.in/",
  },
  {
    id: "iitb",
    name: "IIT Bombay",
    role: "Host institute",
    tier: "host",
    logo: "/assets/iitb-logo.png",
    href: "https://www.iitb.ac.in/",
  },
];

export const SPONSOR_PITCH =
  "Sponsors and partners put their names next to the work: research awards, workshop tracks, poster prizes, and the hallway where founders meet the people studying them. Write to us for the current prospectus.";

/* ── Partner journals ────────────────────────────────────────────────────── */

export type PartnerJournal = {
  id: string;
  name: string;
  note: string;
};

/**
 * Named journals are announced with the acceptance list. Until organisers
 * confirm the titles this stays empty and the page shows the commitment
 * without inventing a masthead.
 */
export const PARTNER_JOURNALS: PartnerJournal[] = [];

export const PARTNER_JOURNALS_PROMISE =
  "The strongest submissions do not stop at the conference. Papers the review panel rates highest are forwarded to our partner journals for editorial review, giving authors a route to publication beyond the two days on campus.";

export const PARTNER_JOURNALS_NOTE =
  "Partner journal titles are announced alongside the acceptance list. Forwarding is a recommendation to the journal, not a guarantee of publication — each title runs its own editorial and peer-review process, and authors keep full control over whether they submit.";

/* ── Research tracks ─────────────────────────────────────────────────────── */

export type ResearchTrack = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  points: string[];
};

export const RESEARCH_TRACKS: ResearchTrack[] = [
  {
    id: "paper",
    kicker: "Track one",
    title: "Research paper presentation",
    body:
      "A full session slot to present completed or near-complete work to a room of entrepreneurship scholars, founders and investors. Submissions are reviewed by a panel of eminent entrepreneurship scholars.",
    points: [
      "Extended abstract up to 1,500 words",
      "Presented in a chaired research session",
      "Eligible for the Best Paper award",
      "Top-rated papers forwarded to partner journals",
    ],
  },
  {
    id: "poster",
    kicker: "Track two",
    title: "Poster presentation",
    body:
      "The format for early results, prototypes and precise questions. Your work stays on the wall through the day, and the conversation happens in the corridor rather than from a lectern.",
    points: [
      "Extended abstract up to 1,500 words",
      "Poster displayed across the conference day",
      "Eligible for the Best Poster award",
      "Direct feedback from reviewers and practitioners",
    ],
  },
  {
    id: "workshop",
    kicker: "Track three",
    title: "Pre-conference workshop",
    body:
      "Hands-on sessions on 30 January on entrepreneurship education, AI for incubators and related themes. Workshop proposals come through the same submissions desk as papers and posters.",
    points: [
      "Proposed through the submissions desk",
      "Runs on the pre-conference day",
      "Practitioner and educator led",
      "Limited seats per session",
    ],
  },
];

export const RESEARCH_HIGHLIGHTS = [
  {
    id: "awards",
    title: "Best Paper & Best Poster awards",
    body:
      "Two awards decided by the review panel across the research and poster sessions.",
  },
  {
    id: "journals",
    title: "Chance to publish with partner journals",
    body:
      "Highest-rated submissions are forwarded to our partner journals for editorial review.",
  },
  {
    id: "network",
    title: "Network with researchers and founders",
    body:
      "Researchers, founders, investors and incubators in the same rooms for two days.",
  },
  {
    id: "workshops",
    title: "Pre-conference workshops",
    body:
      "Hands-on sessions on 30 January before the main conference day.",
  },
] as const;

/* ── Accommodation ───────────────────────────────────────────────────────── */

export const ACCOMMODATION_INTRO =
  "Shared, limited accommodation is available at the IIT Bombay guest house on a first-come, first-served basis. Costs are borne by participants. Everything below is for delegates who have been selected and have paid the registration fee for their category.";

export const ACCOMMODATION_OPTIONS = [
  {
    id: "guest-house",
    name: "IIT Bombay Guest House",
    detail: "On campus, walking distance from the DSSE Building",
    note: "Shared rooms, limited, first-come first-served. Request it in your registration email.",
  },
  {
    id: "hostel",
    name: "Campus hostel rooms",
    detail: "Subject to availability during the academic term",
    note: "Released only if the institute has spare capacity on the conference dates.",
  },
  {
    id: "powai-hotels",
    name: "Hotels in Powai and Andheri East",
    detail: "10–30 minutes from the IIT Bombay Main Gate",
    note: "Booked directly by delegates. The conference does not hold a block rate.",
  },
] as const;

export const ACCOMMODATION_STEPS = [
  {
    n: "1",
    title: "Get selected and pay",
    body: "Accommodation requests are only processed for delegates whose submission has been accepted and whose registration fee is paid.",
  },
  {
    n: "2",
    title: "Reply to your registration email",
    body: `Write to ${CONFERENCE_EMAIL} with your name, dates and whether you need a shared room. The guest house list is filled in the order requests arrive.`,
  },
  {
    n: "3",
    title: "Confirm before you travel",
    body: "You will get a written confirmation with the room and the amount payable at the guest house. Do not travel on an unconfirmed request.",
  },
] as const;

/* ── Contact ─────────────────────────────────────────────────────────────── */

export const CONTACT_ROUTES = [
  {
    id: "submissions",
    label: "Papers, posters and workshops",
    email: CONFERENCE_EMAIL,
    body: "Submission questions, abstract problems, review timelines, accommodation requests.",
  },
  {
    id: "general",
    label: "Everything else",
    email: SUPPORT_EMAIL,
    body: "Press, sponsors and partners, speaking, volunteering, campus access, accounts and payments.",
  },
] as const;

/* ── Landing copy ────────────────────────────────────────────────────────── */

export const HERO_HEADLINE_LEAD = "Where Entrepreneurship Research Meets ";
export const HERO_HEADLINE_ACCENT = "Venture Practice";

export const ABOUT_QUOTE =
  "Entrepreneurship is studied, and entrepreneurship is practised, and the two almost never sit in the same room.";

export const ABOUT_LEAD = [
  "IITB INV.ENT is our attempt to fix that for two days a year.",
  "It is an entrepreneurship research and practice conference, organised by the Desai Sethi School of Entrepreneurship at IIT Bombay. Researchers present work. Practitioners say what they are actually up against. Incubators, investors and founders sit in the same rooms.",
] as const;

export const PROGRAMME_DAYS = [
  {
    id: "pre-conference",
    kicker: "Pre-conference",
    date: "30 JAN",
    title: "Pre-conference",
    lead: "Hands-on workshops on entrepreneurship education and related themes.",
    items: [
      "Workshops",
      "AI for Incubators",
      "Entrepreneurship Education",
      "Hands-on Sessions",
    ],
  },
  {
    id: "conference",
    kicker: "Conference",
    date: "31 JAN",
    title: "Conference",
    lead: "Research, pitches, and the conversations that only happen when both halves of the room are present.",
    items: [
      "Research Paper Presentations",
      "Poster Presentations",
      "Keynote Talks",
      "Panel Discussions",
      "Startup Pitches",
      "Best Paper and Best Poster Awards",
    ],
  },
] as const;

export const PIPELINE = [
  "E-CELL",
  "RESEARCH LABS",
  "DSSE",
  "IDEAS / WIE / GROWW INV.ENT",
  "SINE",
  "STARTUPS",
  "MARKET",
] as const;

export const VENTURES = [
  "Khatabook",
  "Manastu Space",
  "NeoDocs",
  "Rephrase.ai",
  "Proactive For Her",
  "Ushva CleanTech",
  "CareMother",
] as const;

export const SPEAKER_GROUPS = [
  "Researchers",
  "Founders",
  "Investors",
  "Incubators & Ecosystem",
] as const;

export const AUDIENCE = [
  { id: "researchers", label: "Researchers", icon: "paper" },
  { id: "founders", label: "Founders", icon: "person" },
  { id: "investors", label: "Investors", icon: "chart" },
  { id: "incubators", label: "Incubators", icon: "building" },
  { id: "students", label: "Students", icon: "cube" },
] as const;

export type AudienceIcon = (typeof AUDIENCE)[number]["icon"];
