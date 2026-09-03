import {
  PrismaClient,
  EditionStatus,
  SessionFormat,
  Role,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@iitbinvent.com";
const ADMIN_PASSWORD_HASH =
  "$2b$12$S3h8akhtuDhXy5yZJDOrF.4jKqFdNlm.khAFZoSpXvzAn6wO/OQS6";

const DSSE_LAT = 19.1334;
const DSSE_LNG = 72.9153;
const VENUE_NAME = "Desai Sethi School of Entrepreneurship · DSSE Building";
const VENUE_ADDRESS =
  "Desai Sethi School of Entrepreneurship · DSSE Building · IIT Bombay · Powai, Mumbai 400076";

/** IST instant on 31 Jan of `year`. */
function ist(year: number, h: number, m: number) {
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return new Date(`${year}-01-31T${hh}:${mm}:00+05:30`);
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

type Slot = {
  title: string;
  start: [number, number];
  end: [number, number];
  format: SessionFormat;
  description?: string;
  speakers?: string[]; // speaker names to link
};

/** DSSE DAY schedule from organiser artwork (mock / editable placeholders). */
const DSSE_DAY_SLOTS: Slot[] = [
  {
    title: "Registration",
    start: [8, 0],
    end: [9, 0],
    format: SessionFormat.NETWORKING,
  },
  {
    title: "Paper Presentations",
    start: [9, 0],
    end: [11, 15],
    format: SessionFormat.RESEARCH_PAPER,
    description: "Research paper presentations.",
  },
  {
    title: "Coffee Break & Poster Session",
    start: [11, 15],
    end: [11, 45],
    format: SessionFormat.BREAK,
  },
  {
    title: "Paper Presentations",
    start: [11, 45],
    end: [12, 30],
    format: SessionFormat.RESEARCH_PAPER,
  },
  {
    title: "3-Min Research Lightning Talks",
    start: [12, 30],
    end: [13, 15],
    format: SessionFormat.RESEARCH_PAPER,
  },
  {
    title: "Lunch & Poster Session",
    start: [13, 15],
    end: [14, 15],
    format: SessionFormat.BREAK,
  },
  {
    title: "Welcome Address & Program Launch",
    start: [14, 15],
    end: [14, 30],
    format: SessionFormat.KEYNOTE,
    speakers: ["Prof. Trupti Mishra"],
  },
  {
    title: "Director's Address",
    start: [14, 30],
    end: [14, 45],
    format: SessionFormat.KEYNOTE,
    speakers: ["Prof. Shireesh Kedare"],
  },
  {
    title: "Keynote Speaker",
    start: [14, 45],
    end: [15, 15],
    format: SessionFormat.KEYNOTE,
    speakers: ["Mr. Parthasarathy N.S"],
  },
  {
    title: "Fireside Chat",
    start: [15, 15],
    end: [16, 0],
    format: SessionFormat.PANEL,
    speakers: ["Mr. Kishore Biyani", "Prof. Chintan Vaishnav"],
    description: "Fireside chat with moderator.",
  },
  {
    title: "Coffee Break & Poster Session",
    start: [16, 0],
    end: [16, 15],
    format: SessionFormat.BREAK,
  },
  {
    title: "Panel Discussion",
    start: [16, 15],
    end: [17, 0],
    format: SessionFormat.PANEL,
    speakers: [
      "Prof. Basab Chakraborty",
      "Prof. B V Phani",
      "Ms. Poyni Bhatt",
      "Prof. Sankalp Pratap",
    ],
  },
  {
    title: "Closing Plenary & Awards Ceremony",
    start: [17, 0],
    end: [18, 0],
    format: SessionFormat.KEYNOTE,
    speakers: ["Prof. Milind Atrey", "Shri. Bharat Desai"],
  },
  {
    title: "High Tea & Networking",
    start: [18, 0],
    end: [18, 30],
    format: SessionFormat.NETWORKING,
  },
];

const SPEAKER_DEFS = [
  {
    name: "Prof. Trupti Mishra",
    title: "Head, DSSE",
    organisation: "IIT Bombay",
    isKeynote: false,
  },
  {
    name: "Prof. Shireesh Kedare",
    title: "Director",
    organisation: "IIT Bombay",
    isKeynote: false,
  },
  {
    name: "Mr. Parthasarathy N.S",
    title: "Managing Partner",
    organisation: "Mela Ventures",
    isKeynote: true,
  },
  {
    name: "Mr. Kishore Biyani",
    title: "CEO, Future Group & Mentor, The Foundry",
    organisation: "Future Group",
    isKeynote: true,
  },
  {
    name: "Prof. Chintan Vaishnav",
    title: "Moderator · DSSE",
    organisation: "IIT Bombay",
    isKeynote: false,
  },
  {
    name: "Prof. Basab Chakraborty",
    title: "Faculty",
    organisation: "IIT Kharagpur",
    isKeynote: false,
  },
  {
    name: "Prof. B V Phani",
    title: "Faculty",
    organisation: "IIT Kanpur",
    isKeynote: false,
  },
  {
    name: "Ms. Poyni Bhatt",
    title: "Steer X",
    organisation: "Steer X",
    isKeynote: false,
  },
  {
    name: "Prof. Sankalp Pratap",
    title: "Moderator · DSSE",
    organisation: "IIT Bombay",
    isKeynote: false,
  },
  {
    name: "Prof. Milind Atrey",
    title: "Deputy Director (ART)",
    organisation: "IIT Bombay",
    isKeynote: false,
  },
  {
    name: "Shri. Bharat Desai",
    title: "Co-Founder, Syntel · DS Advisors",
    organisation: "DS Advisors",
    isKeynote: true,
  },
];

/**
 * DSSE homepage stats scraped 2026-09 from https://www.dsse.iitb.ac.in/
 * (school-level scoreboard — editable in admin).
 */
const DSSE_SITE_STATS = [
  { label: "Students trained", value: "5550+", sortOrder: 0 },
  { label: "Students mentored", value: "1470+", sortOrder: 1 },
  { label: "Venture teams", value: "670+", sortOrder: 2 },
  { label: "Startups initiated", value: "127", sortOrder: 3 },
];

async function seedProgrammeForEdition(
  editionId: string,
  year: number,
  publish: boolean,
) {
  const track = await prisma.track.create({
    data: {
      editionId,
      name: "DSSE Day Main",
      slug: "main",
      description: "Full-day DSSE Day programme (editable mock from 2026 schedule).",
      colour: "#f58233",
      sortOrder: 0,
    },
  });

  const speakerIds = new Map<string, string>();
  let order = 0;
  for (const s of SPEAKER_DEFS) {
    const row = await prisma.speaker.create({
      data: {
        editionId,
        name: s.name,
        title: s.title,
        organisation: s.organisation,
        bio: `Placeholder bio for ${s.name}. Editable in admin CMS.`,
        isKeynote: s.isKeynote,
        isPublished: publish,
        sortOrder: order++,
      },
    });
    speakerIds.set(s.name, row.id);
  }

  let sortOrder = 0;
  const usedSlugs = new Set<string>();
  for (const slot of DSSE_DAY_SLOTS) {
    let slug = slugify(slot.title);
    if (usedSlugs.has(slug)) slug = `${slug}-${slot.start[0]}${slot.start[1]}`;
    usedSlugs.add(slug);

    const session = await prisma.session_.create({
      data: {
        editionId,
        trackId: track.id,
        title: slot.title,
        slug,
        description:
          slot.description ??
          "Editable programme placeholder — update times/rooms in admin.",
        format: slot.format,
        startsAt: ist(year, slot.start[0], slot.start[1]),
        endsAt: ist(year, slot.end[0], slot.end[1]),
        room: "DSSE Building",
        floor: "TBA",
        isPublished: publish,
        sortOrder: sortOrder++,
      },
    });

    for (const name of slot.speakers ?? []) {
      const speakerId = speakerIds.get(name);
      if (!speakerId) continue;
      const role = name.includes("Moderator") || name.includes("Chintan") || name.includes("Sankalp")
        ? "Moderator"
        : "Speaker";
      await prisma.sessionSpeaker.create({
        data: {
          sessionId: session.id,
          speakerId,
          role,
        },
      });
    }
  }
}

async function main() {
  console.log("Seeding INVENT platform…");

  const seedPlain = process.env.ADMIN_SEED_PASSWORD?.trim();
  const passwordHash = seedPlain
    ? await bcrypt.hash(seedPlain, 12)
    : ADMIN_PASSWORD_HASH;

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    create: {
      email: ADMIN_EMAIL,
      name: "INVENT Admin",
      role: Role.ADMIN,
      emailVerified: new Date(),
      passwordHash,
      profile: {
        create: {
          personaType: "OPERATOR",
          headline: "INVENT organiser · DSSE IIT Bombay",
          organisation: "Desai Sethi School of Entrepreneurship",
          completeness: 50,
          directoryOptIn: false,
        },
      },
    },
    update: {
      role: Role.ADMIN,
      name: "INVENT Admin",
      passwordHash,
    },
  });
  console.log(`  • Admin: ${admin.email}`);

  await prisma.notifySignup.deleteMany();
  await prisma.editionStat.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.page.deleteMany();
  await prisma.sponsor.deleteMany();
  await prisma.sessionSpeaker.deleteMany();
  await prisma.rsvp.deleteMany();
  await prisma.session_.deleteMany();
  await prisma.speaker.deleteMany();
  await prisma.track.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.edition.deleteMany();

  // ─── 2026 ARCHIVED — full DSSE Day schedule from artwork ─────────────────
  const edition2026 = await prisma.edition.create({
    data: {
      year: 2026,
      slug: "2026",
      name: "INVENT 2026 · DSSE Day",
      tagline: "DSSE Day 2026 archive",
      theme: "DSSE Day",
      startsAt: ist(2026, 0, 0),
      endsAt: new Date("2026-01-31T23:59:59+05:30"),
      venueName: VENUE_NAME,
      venueAddress: VENUE_ADDRESS,
      venueLat: DSSE_LAT,
      venueLng: DSSE_LNG,
      timezone: "Asia/Kolkata",
      status: EditionStatus.ARCHIVED,
      isCurrent: false,
    },
  });

  await seedProgrammeForEdition(edition2026.id, 2026, true);

  await prisma.page.create({
    data: {
      editionId: edition2026.id,
      slug: "about",
      title: "About INVENT 2026",
      body: "Archived DSSE Day 2026 programme. Content sourced from organiser schedule artwork — editable in CMS.",
      isPublished: true,
    },
  });

  // ─── 2027 CURRENT — same mock schedule, fully editable ───────────────────
  const edition2027 = await prisma.edition.create({
    data: {
      year: 2027,
      slug: "2027",
      name: "INVENT 2027",
      tagline: "Where entrepreneurship research meets venture practice",
      theme: "DSSE Day",
      startsAt: ist(2027, 0, 0),
      endsAt: new Date("2027-01-31T23:59:59+05:30"),
      venueName: VENUE_NAME,
      venueAddress: VENUE_ADDRESS,
      venueLat: DSSE_LAT,
      venueLng: DSSE_LNG,
      timezone: "Asia/Kolkata",
      status: EditionStatus.ANNOUNCED,
      isCurrent: true,
      connectNoteTemplate:
        "Hi {firstName}, I'm {senderName}, attending IIT Bombay INVENT on {eventDateShort}. Nice to connect.",
    },
  });

  // Stats from DSSE website scrape (https://www.dsse.iitb.ac.in/) — editable
  await prisma.editionStat.createMany({
    data: DSSE_SITE_STATS.map((s) => ({
      editionId: edition2027.id,
      ...s,
    })),
  });

  await seedProgrammeForEdition(edition2027.id, 2027, true);

  await prisma.page.createMany({
    data: [
      {
        editionId: edition2027.id,
        slug: "about",
        title: "About",
        body: `On 31 January the Desai Sethi School of Entrepreneurship marks DSSE Day at IIT Bombay.\n\nDSSE trains aspiring entrepreneurs through academic and pre-incubation programs. Scraped school figures (editable): 5550+ students trained, 1470+ mentored, 670+ venture teams, 127 startups initiated.\n\nSource: [dsse.iitb.ac.in](https://www.dsse.iitb.ac.in/). Campus partners include [E-Cell](https://ecell.in) and [SINE](https://sineiitb.org).`,
        isPublished: true,
      },
      {
        editionId: edition2027.id,
        slug: "travel",
        title: "Travel",
        body: `Venue: ${VENUE_ADDRESS}\n\nNearest: IIT Bombay Main Gate, Powai, Mumbai.\n\nTODO: confirm gate access instructions with organisers.`,
        isPublished: true,
      },
      {
        editionId: edition2027.id,
        slug: "code-of-conduct",
        title: "Code of conduct",
        body: "Be excellent. No harassment. Organisers may remove anyone who makes the room worse. Contact support@iitbinvent.com.",
        isPublished: true,
      },
      {
        editionId: edition2027.id,
        slug: "privacy",
        title: "Privacy",
        body: "Directory opt-in defaults to off. Email is never shown unless you enable showEmail. Contact admin@iitbinvent.com for data requests.",
        isPublished: true,
      },
    ],
  });

  await prisma.faq.createMany({
    data: [
      {
        editionId: edition2027.id,
        question: "When is INVENT 2027?",
        answer: "Sunday 31 January 2027, Asia/Kolkata, DSSE Building, IIT Bombay.",
        sortOrder: 0,
        isPublished: true,
      },
      {
        editionId: edition2027.id,
        question: "Where is the venue?",
        answer: VENUE_ADDRESS,
        sortOrder: 1,
        isPublished: true,
      },
      {
        editionId: edition2027.id,
        question: "How do I register?",
        answer: "Create an account via Login → Sign up. Completing your profile is optional but helps other attendees find you.",
        sortOrder: 2,
        isPublished: true,
      },
    ],
  });

  // Demo attendee for admin user lists
  const demoHash = await bcrypt.hash("Attendee@3101", 12);
  const demo = await prisma.user.upsert({
    where: { email: "demo@iitbinvent.com" },
    create: {
      email: "demo@iitbinvent.com",
      name: "Demo Attendee",
      role: Role.ATTENDEE,
      passwordHash: demoHash,
      emailVerified: new Date(),
      profile: {
        create: {
          personaType: "STUDENT",
          headline: "Final year · IIT Bombay",
          organisation: "IIT Bombay",
          interests: ["deeptech", "climate"],
          lookingFor: ["co-founder"],
          completeness: 55,
          directoryOptIn: true,
        },
      },
    },
    update: { passwordHash: demoHash },
  });

  await prisma.registration.create({
    data: {
      userId: demo.id,
      editionId: edition2027.id,
      status: "CONFIRMED",
      ticketCode: `INV27-${randomBytes(3).toString("hex").toUpperCase()}`,
      qrToken: randomBytes(24).toString("hex"),
      source: "seed",
    },
  });

  await prisma.registration.create({
    data: {
      userId: admin.id,
      editionId: edition2027.id,
      status: "CONFIRMED",
      ticketCode: `INV27-ADMIN`,
      qrToken: randomBytes(24).toString("hex"),
      source: "seed",
    },
  });

  console.log("Seeded editions 2026 (archive) + 2027 (current) with DSSE Day programme.");
  console.log("  • Stats from dsse.iitb.ac.in (editable in admin)");
  console.log("  • Demo attendee: demo@iitbinvent.com / Attendee@3101");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
