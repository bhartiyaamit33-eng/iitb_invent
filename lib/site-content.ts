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
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/research", label: "Call for papers" },
  { href: "/workshop", label: "Workshops & events" },
  { href: "/speakers", label: "Speakers" },
  { href: "/team", label: "Team" },
  { href: "/contact", label: "Contact" },
];

/** Public pages, grouped for the footer. Header stays shorter. */
export const FOOTER_COLUMNS: { title: string; items: NavItem[] }[] = [
  {
    title: "Conference",
    items: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/research", label: "Call for papers" },
      { href: "/programme", label: "Programme" },
      { href: "/speakers", label: "Speakers" },
      { href: "/workshop", label: "Workshops & events" },
      { href: "/team", label: "Team" },
    ],
  },
  {
    title: "Plan",
    items: [
      { href: "/travel", label: "Travel" },
      { href: "/accommodation", label: "Accommodation" },
      { href: "/sponsors", label: "Sponsors & partners" },
      { href: "/faq", label: "FAQs" },
      { href: "/contact", label: "Contact" },
      { href: "/login", label: "Login" },
      { href: "/signup", label: "Create account" },
    ],
  },
];

export const FOOTER_POLICY_NAV: NavItem[] = [
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
  /** Wide lockups need two columns or the mark becomes unreadable. */
  wide?: boolean;
};

/**
 * Only list an organisation here once its MoU is signed. An empty list renders
 * a "coming soon" plate rather than a gap, so nothing is announced early.
 *
 * Logos drop in by adding `logo: "/assets/partners/<file>.png"`; a plate with
 * no logo falls back to the name set in serif.
 * British Academy of Management joins this list when their logo arrives.
 */
export const SPONSORS: SiteOrg[] = [];

export const PARTNERS: SiteOrg[] = [
  {
    id: "sbertc",
    name: "SBERTC, IIT Kanpur",
    role: "Conference partner",
    tier: "partner",
    logo: "/assets/partners/sbertc-iitk.png",
    href: "https://sbertc.iitk.ac.in/",
  },
  {
    id: "iimb",
    name: "IIM Bangalore",
    role: "Partner institute",
    tier: "partner",
    logo: "/assets/partners/iimb.png",
    href: "https://www.iimb.ac.in/",
    wide: true,
  },
  {
    id: "service-setu-academics",
    name: "ServiceSetu Academics",
    role: "Academic partner",
    tier: "partner",
    logo: "/assets/partners/servicesetu-academics.png",
  },
  {
    id: "edii",
    name: "Entrepreneurship Development Institute of India",
    role: "Partner institute",
    tier: "partner",
    logo: "/assets/partners/edii.png",
    href: "https://www.ediindia.org/",
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
  shortName: string;
  href: string;
  role: string;
  summary: string;
};

/**
 * Publication partners only. Copy must say selected authors may submit, and
 * must not imply the conference or the journal has promised publication.
 */
export const PARTNER_JOURNALS: PartnerJournal[] = [
  {
    id: "joe",
    name: "The Journal of Entrepreneurship",
    shortName: "JoE",
    href: "https://journals.sagepub.com/home/joe",
    role: "Publication partner",
    summary:
      "Authors of the best selected papers on entrepreneurship may submit to JoE. Those papers are read as regular submissions.",
  },
];

export const PARTNER_JOURNALS_PROMISE =
  "The Journal of Entrepreneurship (JoE) is the publication partner for IITB INV.ENT 2027. The partnership invites selected authors to submit. It does not place a paper in the journal.";

export const PARTNER_JOURNALS_NOTE =
  "Selected papers are eligible for submission to JoE. They are not assured of publication. Each paper is treated as a regular submission and goes through JoE’s standard review. The decision rests solely with the journal’s editorial team.";

/** ServiceSetu Research Travel Grant. Awarded by ServiceSetu, not by the conference. */
export const TRAVEL_GRANT = {
  name: "ServiceSetu Research Travel Grant",
  partner: "ServiceSetu Academics",
  href: "https://www.servicesetu.org/travel-grant",
  amount: "₹15,000",
  who: "Full-time PhD and FPM scholars enrolled at a recognised Indian institution",
  purpose: "Travel support to present research at IITB INV.ENT",
  caveat:
    "Apply separately on the ServiceSetu site. Every request is reviewed, and approval rests with ServiceSetu Academics. Acceptance at the conference does not award the grant.",
} as const;

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
      "Best selected papers may be submitted to JoE",
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
    title: "Eligible to submit to JoE",
    body:
      "Authors of the best selected entrepreneurship papers may submit to The Journal of Entrepreneurship. Publication is not assured.",
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
    id: "anantha",
    name: "Anantha Hotels",
    detail: "Partner hotel, off campus in Bhandup West",
    note: "Book directly with the hotel and ask for the IITB INV.ENT rate. Address, contact and rates are on the travel page.",
  },
] as const;

/** Off-campus partner hotel. Rates are the discounted "Your Rate" from Anantha, single / double. */
export const ANANTHA_HOTEL = {
  name: "Anantha Hotels",
  property: "Hotel Anantha Executive Suites",
  website: "https://www.ananthahotels.com/",
  websiteLabel: "ananthahotels.com",
  address: [
    "Near 'S' Ward, BMC Office",
    "LBS Marg",
    "Bhandup West, Mumbai 400078",
  ],
  mapsQuery:
    "Hotel Anantha Executive Suites, LBS Marg, Bhandup West, Mumbai 400078",
  contactName: "Anupama Dalvi",
  phones: [
    { display: "+91 7506333242", tel: "+917506333242" },
    { display: "+91 7506333244", tel: "+917506333244" },
  ],
  email: "bookings@ananthahotels.com",
  rates: [
    { id: "executive", room: "Executive", tariff: "₹5,000", single: "₹4,000", double: "₹4,500" },
    { id: "deluxe", room: "Deluxe", tariff: "₹6,000", single: "₹5,000", double: "₹5,500" },
    { id: "anantha-deluxe", room: "Anantha Deluxe", tariff: "₹7,000", single: "₹6,000", double: "₹6,500" },
  ],
} as const;

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

/* ── Team ────────────────────────────────────────────────────────────────── */

export type CommitteeMember = {
  name: string;
  role: string;
  /** Omitted when a portrait has not been supplied yet. */
  photo?: string;
  /** CSS object-position so a square crop keeps the face. */
  focus: string;
};

/**
 * Organising committee, in the order they should appear.
 * Portraits are the public faculty photos on dsse.iitb.ac.in and iitb.ac.in.
 */
export const ORGANIZING_COMMITTEE: CommitteeMember[] = [
  {
    name: "Prof. Shireesh Kedare",
    role: "Director, IIT Bombay",
    photo: "/assets/speakers/shireesh-kedare.jpg",
    focus: "center 30%",
  },
  {
    name: "Prof. Milind Atrey",
    role: "DD-ART, IIT Bombay",
    photo: "/assets/team/milind-atrey.jpg",
    focus: "42% 20%",
  },
  {
    name: "Prof. Trupti Mishra",
    role: "Head, DSSE",
    photo: "/assets/team/trupti-mishra.jpg",
    focus: "center 16%",
  },
  {
    name: "Prof. Ramesh Kuruva",
    role: "Conference Chair",
    photo: "/assets/team/ramesh-kuruva.jpg",
    focus: "center 28%",
  },
  {
    name: "Prof. Sankalp Pratap",
    role: "Member",
    photo: "/assets/team/sankalp-pratap.png",
    focus: "center 30%",
  },
  {
    name: "Prof. Anuradha Narasimhan",
    role: "Member",
    photo: "/assets/team/anuradha-narasimhan.png",
    focus: "center 35%",
  },
  {
    name: "Prof. Lina Sonne Vyas",
    role: "Member",
    photo: "/assets/team/lina-sonne-vyas.jpg",
    focus: "center 20%",
  },
  {
    name: "Prof. Vishal Gupta",
    role: "Member",
    photo: "/assets/team/vishal-gupta.png",
    focus: "center",
  },
  {
    name: "Prof. Gokul Krishnan",
    role: "Member",
    photo: "/assets/team/gokul-krishnan.jpg",
    focus: "center 18%",
  },
  {
    name: "Prof. Poyni Bhatt",
    role: "Member",
    photo: "/assets/team/poyni-bhatt.jpg",
    focus: "center 22%",
  },
];

/**
 * DSSE staff on the organising team.
 * PhD students are listed with them on the team page.
 */
export const ORGANIZING_MEMBERS: CommitteeMember[] = [
  {
    name: "Sanjay Kharat",
    role: "Assistant Project Manager, DSSE",
    photo: "/assets/team/sanjay-kharat.jpg",
    focus: "center 28%",
  },
  {
    name: "Alka Chavan",
    role: "Project Manager, DSSE",
    photo: "/assets/team/alka-chavan.jpg",
    focus: "center 30%",
  },
  {
    name: "Raja Shaw",
    role: "Jr Administrative Assistant",
    photo: "/assets/team/raja-shaw.jpg",
    focus: "center 22%",
  },
];

/**
 * Technical committee, in the order they should appear.
 * Portraits are the public faculty photos on som.iitb.ac.in, hss.iitb.ac.in,
 * me.iitb.ac.in, homepages.iitb.ac.in and iimb.ac.in.
 */
export const TECHNICAL_COMMITTEE: CommitteeMember[] = [
  {
    name: "Prof. Sawan Rathi",
    role: "IIT Bombay",
    photo: "/assets/team/sawan-rathi.jpg",
    focus: "center 22%",
  },
  {
    name: "Prof. Rohan Chinchwadkar",
    role: "IIT Bombay",
    photo: "/assets/team/rohan-chinchwadkar.jpg",
    focus: "center 30%",
  },
  {
    name: "Prof. Snehal Awate",
    role: "IIT Bombay",
    photo: "/assets/team/snehal-awate.jpg",
    focus: "center 18%",
  },
  {
    name: "Prof. Kirankumar Momaya",
    role: "IIT Bombay",
    photo: "/assets/team/kirankumar-momaya.jpg",
    focus: "58% 28%",
  },
  {
    name: "Prof. Lina Sonne Vyas",
    role: "IIT Bombay",
    photo: "/assets/team/lina-sonne-vyas.jpg",
    focus: "center 20%",
  },
  {
    name: "Prof. Pooja Purang",
    role: "IIT Bombay",
    photo: "/assets/team/pooja-purang.jpg",
    focus: "center 18%",
  },
  {
    name: "Prof. Rajendra Sonar",
    role: "IIT Bombay",
    photo: "/assets/team/rajendra-sonar.jpg",
    focus: "center 28%",
  },
  {
    name: "Prof. Amber Shrivastava",
    role: "IIT Bombay",
    photo: "/assets/team/amber-shrivastava.jpg",
    focus: "center 62%",
  },
  {
    name: "Prof. Suresh Bhagavatula",
    role: "IIM Bangalore",
    photo: "/assets/team/suresh-bhagavatula.jpg",
    focus: "center 30%",
  },
  {
    name: "Prof. Sayan Sarkar",
    role: "IIM Bangalore",
    photo: "/assets/team/sayan-sarkar.jpg",
    focus: "center 22%",
  },
];

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

export const HERO_HEADLINE_LEAD = "Entrepreneurship Research and Practice ";
export const HERO_HEADLINE_ACCENT = "Conference";

/** Homepage statement. The About page keeps the longer original line. */
export const HOME_QUOTE =
  "Entrepreneurship is studied and practised, but rarely do the two meet.";

export const HOME_BRIDGE =
  "IITB INV.ENT is filling this gap. We are bringing together entrepreneurship researchers and practitioners in the same room.";

export const ABOUT_QUOTE =
  "Entrepreneurship is studied, and entrepreneurship is practised, and the two almost never sit in the same room.";

/** Two homepage columns. The dated programme on /programme is unchanged. */
export const HOME_AUDIENCES = [
  {
    id: "researchers",
    title: "For entrepreneurship researchers",
    items: [
      "Present your research | Paper & poster presentation",
      "Workshop on research paper development",
      "Workshop on teaching entrepreneurship",
    ],
  },
  {
    id: "practitioners",
    title: "For entrepreneurship practitioners",
    items: [
      "Startup showcase",
      "Startup pitching competition",
      "Entrepreneurship bootcamp for startups",
      "Workshop on AI for incubators",
    ],
  },
] as const;

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

export const VENTURES: { name: string; href: string; shot?: string }[] = [
  { name: "Khatabook", href: "https://khatabook.com/", shot: "/assets/ventures/khatabook.jpg" },
  { name: "Manastu Space", href: "https://manastuspace.com/", shot: "/assets/ventures/manastu.jpg" },
  { name: "NeoDocs", href: "https://www.neodocs.in/", shot: "/assets/ventures/neodocs.jpg" },
  { name: "Rephrase.ai", href: "https://www.rephrase.ai/" },
  { name: "Proactive For Her", href: "https://proactiveforher.com/", shot: "/assets/ventures/proactive.jpg" },
  { name: "Ushva CleanTech", href: "https://www.ushva.com/", shot: "/assets/ventures/ushva.jpg" },
  { name: "CareMother", href: "https://caremother.in/", shot: "/assets/ventures/caremother.jpg" },
];

export type PastSpeaker = {
  name: string;
  title: string;
  organisation: string;
  photo: string;
  /** CSS object-position so a 4:5 crop keeps the face. */
  focus: string;
};

/**
 * Stage speakers at the Entrepreneurship Research Symposium & DSSE Day,
 * 31 January 2026, ordered for a visitor: benefactors and public names,
 * then the Director and Head, then the rest of the faculty.
 * Paper and poster presenters are not listed here.
 */
export const PAST_SPEAKERS: PastSpeaker[] = [
  {
    name: "Shri Bharat Desai",
    title: "Co-founder, Syntel",
    organisation: "DS Advisors",
    photo: "/assets/speakers/bharat-desai-portrait.jpg",
    focus: "center center",
  },
  {
    name: "Mr. Kishore Biyani",
    title: "Mentor, The Foundery",
    organisation: "Future Group",
    photo: "/assets/speakers/kishore-biyani.png",
    focus: "center 18%",
  },
  {
    name: "Mr. Parthasarathy N.S.",
    title: "Managing Partner",
    organisation: "Mela Ventures",
    photo: "/assets/speakers/parthasarathy-ns.jpg",
    focus: "center 22%",
  },
  {
    name: "Prof. Shireesh Kedare",
    title: "Director",
    organisation: "IIT Bombay",
    photo: "/assets/speakers/shireesh-kedare.jpg",
    focus: "center 30%",
  },
  {
    name: "Prof. Milind Atrey",
    title: "Deputy Director (ART)",
    organisation: "IIT Bombay",
    photo: "/assets/team/milind-atrey.jpg",
    focus: "42% 20%",
  },
  {
    name: "Prof. Trupti Mishra",
    title: "Head, DSSE",
    organisation: "IIT Bombay",
    photo: "/assets/team/trupti-mishra.jpg",
    focus: "center 16%",
  },
  {
    name: "Prof. Poyni Bhatt",
    title: "Chairperson",
    organisation: "SEDEMAC",
    photo: "/assets/team/poyni-bhatt.jpg",
    focus: "center 22%",
  },
  {
    name: "Prof. Sankalp Pratap",
    title: "Faculty, DSSE",
    organisation: "IIT Bombay",
    photo: "/assets/team/sankalp-pratap.png",
    focus: "center 30%",
  },
  {
    name: "Prof. Anuradha Narasimhan",
    title: "Faculty, DSSE",
    organisation: "IIT Bombay",
    photo: "/assets/team/anuradha-narasimhan.png",
    focus: "center 35%",
  },
  {
    name: "Prof. Suresh Bhagavatula",
    title: "Faculty",
    organisation: "IIM Bangalore",
    photo: "/assets/speakers/suresh-bhagavatula.jpg",
    focus: "center 35%",
  },
  {
    name: "Prof. Basab Chakraborty",
    title: "Faculty",
    organisation: "IIT Kharagpur",
    photo: "/assets/speakers/basab-chakraborty.jpg",
    focus: "center 30%",
  },
  {
    name: "Prof. B. V. Phani",
    title: "Faculty",
    organisation: "IIT Kanpur",
    photo: "/assets/speakers/bv-phani.jpg",
    focus: "center 42%",
  },
];

export const AUDIENCE = [
  { id: "researchers", label: "Researchers", icon: "paper" },
  { id: "founders", label: "Founders", icon: "person" },
  { id: "investors", label: "Investors", icon: "chart" },
  { id: "incubators", label: "Incubators", icon: "building" },
  { id: "students", label: "Students", icon: "cube" },
] as const;

export type AudienceIcon = (typeof AUDIENCE)[number]["icon"];
