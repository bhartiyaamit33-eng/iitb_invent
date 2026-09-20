import { SUBMIT_HREF, submitHrefFor } from "@/lib/landing";

export const SITE_NAV = [
  { href: "/about", label: "About", testId: "nav-about" },
  { href: "/programme", label: "Programme", testId: "nav-programme" },
  { href: "/research", label: "Research", testId: "nav-research" },
  { href: "/workshops", label: "Workshop", testId: "nav-workshop" },
  { href: "/partners", label: "Partners", testId: "nav-partners" },
  { href: "/accommodation", label: "Accommodation", testId: "nav-accommodation" },
  { href: "/contact", label: "Contact", testId: "nav-contact" },
] as const;

export const FOOTER_NAV = [
  { href: "/about", label: "About" },
  { href: "/programme", label: "Programme" },
  { href: "/speakers", label: "Speakers" },
  { href: "/research", label: "Research" },
  { href: "/partners", label: "Partners" },
  { href: "/travel", label: "Venue" },
  { href: "/contact", label: "Contact" },
] as const;

export const FOOTER_META_NAV = [
  { href: "/conference", label: "Call for papers" },
  { href: "/workshops", label: "Workshop" },
  { href: "/faq", label: "FAQ" },
  { href: "/accommodation", label: "Accommodation" },
  { href: "/privacy", label: "Privacy" },
  { href: "/code-of-conduct", label: "Code of conduct" },
] as const;

export const REGISTER_HREF = "/conference";
export const CONTACT_EMAIL = "support@iitbinvent.com";

export function registerHrefFor(signedIn: boolean) {
  return signedIn ? "/dashboard" : REGISTER_HREF;
}

export function accountHrefFor(signedIn: boolean) {
  return signedIn ? "/dashboard" : "/login";
}

export function signedInLabel(user: { name: string } | null | undefined) {
  if (!user) return null;
  const first = user.name.trim().split(/\s+/)[0];
  return first || user.name || "Account";
}

export { SUBMIT_HREF, submitHrefFor };

export const ECOSYSTEM_STATS = [
  { value: "5,550+", numeric: 5550, suffix: "+", label: "Students trained" },
  { value: "1,470+", numeric: 1470, suffix: "+", label: "Students mentored" },
  { value: "670+", numeric: 670, suffix: "+", label: "Venture teams" },
  { value: "127", numeric: 127, suffix: "", label: "Startups" },
  { value: "20", numeric: 20, suffix: "", label: "Entrepreneurship courses" },
  { value: "30,000+", numeric: 30000, suffix: "+", label: "E-Summit participants" },
] as const;

export const PIPELINE = [
  "E-CELL",
  "RESEARCH LABS",
  "DSSE",
  "IDEAS / WiE / GROW",
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

export const PRACTICE_WORDS = [
  "Startups",
  "Experience",
  "Founders",
  "Investors",
  "Execution",
] as const;

export const RESEARCH_WORDS = [
  "Papers",
  "Evidence",
  "Universities",
  "Researchers",
  "Theory",
] as const;

export const ROOM_CATEGORIES = [
  { label: "Researchers", icon: "research" as const },
  { label: "Founders", icon: "founders" as const },
  { label: "Investors", icon: "investors" as const },
  { label: "Incubators", icon: "incubators" as const },
  { label: "Students", icon: "students" as const },
  { label: "Operators", icon: "operators" as const },
  { label: "Mentors", icon: "mentors" as const },
] as const;

export const PROGRAMME_DAYS = [
  {
    id: "pre",
    date: "30 JAN",
    kicker: "Pre-conference",
    title: "Pre-conference",
    intro: "Hands-on workshops on entrepreneurship education and related themes.",
    items: [
      "Workshops",
      "AI for Incubators",
      "Entrepreneurship Education",
      "Hands-on Sessions",
    ],
  },
  {
    id: "conf",
    date: "31 JAN",
    kicker: "Conference",
    title: "Conference",
    intro:
      "Research, pitches, and the conversations that only happen when both halves of the room are present.",
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

export const RESEARCH_THEMES = [
  "Entrepreneurship Education",
  "Innovation",
  "Startup Ecosystems",
  "Venture Creation",
  "University Entrepreneurship",
  "Inclusive Innovation",
  "Social Entrepreneurship",
  "Lab-to-Market",
  "Entrepreneurial Finance",
] as const;

export const PARTNER_TIERS = [
  {
    id: "hosted",
    title: "Hosted by",
    partners: [
      { name: "Desai Sethi School of Entrepreneurship", href: "https://www.dsse.iitb.ac.in/" },
      { name: "IIT Bombay", href: "https://www.iitb.ac.in/" },
    ],
  },
  { id: "institutional", title: "Institutional partners", partners: [] as { name: string; href?: string }[] },
  { id: "knowledge", title: "Knowledge partners", partners: [] as { name: string; href?: string }[] },
  {
    id: "ecosystem",
    title: "Ecosystem partners",
    partners: [
      { name: "E-Cell", href: "https://ecell.in" },
      { name: "SINE", href: "https://sineiitb.org" },
    ],
  },
  { id: "sponsors", title: "Sponsors", partners: [] as { name: string; href?: string }[] },
] as const;

export const SPEAKER_CATEGORIES = [
  "Researchers",
  "Founders",
  "Investors",
  "Incubators & Ecosystem",
] as const;

export const RESEARCH_AWARDS = [
  {
    title: "Best Paper",
    body: "Awarded for the strongest research contribution presented at the conference. Selected papers carry publication opportunities.",
  },
  {
    title: "Best Poster",
    body: "Awarded for the strongest poster presentation.",
  },
] as const;

export const WORKSHOP_ITEMS = [
  {
    title: "AI for Incubators",
    body: "A pre-conference workshop on entrepreneurship education and related themes.",
  },
  {
    title: "Entrepreneurship Education",
    body: "Hands-on sessions on the day before the conference.",
  },
] as const;

export const ABOUT_TIMELINE = [
  { year: "2010", body: "IIT Bombay starts thinking about a dedicated centre to teach innovation and entrepreneurship." },
  { year: "2014", body: "Bharat Desai and Neerja Sethi give one million dollars to start the Centre. The Board of Governors approves it on 31 January." },
  { year: "2019", body: "The Board approves conversion of the Centre into a School." },
  { year: "2024", body: "A PhD programme in innovation and entrepreneurship begins." },
  { year: "2025", body: "Entrepreneurship Day symposium Catalysing University Entrepreneurship draws more than 300 people." },
  { year: "2027", body: "IITB INV.ENT carries that meeting point forward, now across two days." },
] as const;
