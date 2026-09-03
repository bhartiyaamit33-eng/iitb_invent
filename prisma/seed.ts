import { PrismaClient, EditionStatus, SessionFormat, Role } from "@prisma/client";

const prisma = new PrismaClient();

/** Only this allowlisted mailbox is seeded as ADMIN (see ADMIN_EMAILS). */
const ADMIN_EMAIL = "admin@iitbinvent.com";

/** IIT Bombay DSSE Building, Powai — approximate campus coordinates */
const DSSE_LAT = 19.1334;
const DSSE_LNG = 72.9153;

const VENUE_NAME = "Desai Sethi School of Entrepreneurship · DSSE Building";
const VENUE_ADDRESS =
  "Desai Sethi School of Entrepreneurship · DSSE Building · IIT Bombay · Powai, Mumbai 400076";

/**
 * Asia/Kolkata day bounds for Sunday 31 January 2027.
 * Stored as absolute instants (UTC) corresponding to local IST.
 */
const JAN_31_2027_START = new Date("2027-01-31T00:00:00+05:30");
const JAN_31_2027_END = new Date("2027-01-31T23:59:59+05:30");

async function main() {
  console.log("Seeding INVENT editions…");

  // Bootstrap sole ADMIN — allowlist-enforced at runtime too.
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    create: {
      email: ADMIN_EMAIL,
      name: "INVENT Admin",
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
    update: {
      role: Role.ADMIN,
      name: "INVENT Admin",
    },
  });
  console.log(`  • Admin user: ${admin.email} (${admin.role})`);

  // Wipe programme/CMS rows so seed is idempotent in local/dev.
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

  // ─── 2026 ARCHIVED ────────────────────────────────────────────────────────
  const edition2026 = await prisma.edition.create({
    data: {
      year: 2026,
      slug: "2026",
      name: "INVENT 2026",
      tagline: "Archive placeholder — TODO: confirm with organisers",
      theme: null,
      startsAt: new Date("2026-01-31T00:00:00+05:30"),
      endsAt: new Date("2026-01-31T23:59:59+05:30"),
      venueName: VENUE_NAME,
      venueAddress: VENUE_ADDRESS,
      venueLat: DSSE_LAT,
      venueLng: DSSE_LNG,
      timezone: "Asia/Kolkata",
      status: EditionStatus.ARCHIVED,
      isCurrent: false,
      connectNoteTemplate:
        "Hi {firstName}, I'm {senderName}, attending IIT Bombay INVENT on {eventDateShort}. Nice to connect.",
      pages: {
        create: [
          {
            slug: "about",
            title: "About INVENT 2026",
            body: "TODO: confirm with organisers — archived about page placeholder.",
            isPublished: true,
          },
        ],
      },
      faqs: {
        create: [
          {
            question: "Where was INVENT 2026 held?",
            answer:
              "DSSE Building, IIT Bombay, Powai. TODO: confirm with organisers.",
            sortOrder: 0,
            isPublished: true,
          },
        ],
      },
    },
  });

  // ─── 2027 ANNOUNCED (current) ─────────────────────────────────────────────
  const edition2027 = await prisma.edition.create({
    data: {
      year: 2027,
      slug: "2027",
      name: "INVENT 2027",
      // TODO: confirm with organisers — "third edition" claim on live landing is unverified
      tagline: "Where entrepreneurship research meets venture practice",
      theme: "DSSE Day",
      startsAt: JAN_31_2027_START,
      endsAt: JAN_31_2027_END,
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

  // Homepage-style stats — ALL INVENTED; flag before launch (PRD §20)
  // TODO: confirm with organisers
  await prisma.editionStat.createMany({
    data: [
      {
        editionId: edition2027.id,
        label: "Attendees",
        value: "1200+",
        sortOrder: 0,
      }, // TODO: confirm with organisers — invented
      {
        editionId: edition2027.id,
        label: "Papers",
        value: "86",
        sortOrder: 1,
      }, // TODO: confirm with organisers — invented
      {
        editionId: edition2027.id,
        label: "Startups",
        value: "40",
        sortOrder: 2,
      }, // TODO: confirm with organisers — invented
      {
        editionId: edition2027.id,
        label: "Investors",
        value: "35",
        sortOrder: 3,
      }, // TODO: confirm with organisers — invented
    ],
  });

  const researchTrack = await prisma.track.create({
    data: {
      editionId: edition2027.id,
      name: "Research Presentations",
      slug: "research",
      description:
        "TODO: confirm with organisers — placeholder research track.",
      colour: "#1a9fd4",
      sortOrder: 0,
    },
  });

  await prisma.track.create({
    data: {
      editionId: edition2027.id,
      name: "Venture & Pitch",
      slug: "venture",
      description: "TODO: confirm with organisers — placeholder venture track.",
      colour: "#12b86a",
      sortOrder: 1,
    },
  });

  // Programme times / rooms — placeholders (PRD §20)
  // TODO: confirm with organisers
  await prisma.session_.createMany({
    data: [
      {
        editionId: edition2027.id,
        trackId: researchTrack.id,
        title: "Open",
        slug: "open",
        description:
          "Doors, badges, coffee. TODO: confirm with organisers — room TBA.",
        format: SessionFormat.NETWORKING,
        startsAt: new Date("2027-01-31T09:30:00+05:30"),
        endsAt: new Date("2027-01-31T10:45:00+05:30"),
        room: "TBA", // TODO: confirm with organisers
        isPublished: false,
        sortOrder: 0,
      },
      {
        editionId: edition2027.id,
        title: "Foundation hour",
        slug: "foundation-hour",
        description:
          "Why 31 January matters. Speakers to be announced. TODO: confirm with organisers.",
        format: SessionFormat.KEYNOTE,
        startsAt: new Date("2027-01-31T11:00:00+05:30"),
        endsAt: new Date("2027-01-31T12:30:00+05:30"),
        room: "TBA", // TODO: confirm with organisers
        isPublished: false,
        sortOrder: 1,
      },
      {
        editionId: edition2027.id,
        title: "Inv.ent pitches",
        slug: "pitches",
        description:
          "Short pitches. Speakers to be announced. TODO: confirm with organisers.",
        format: SessionFormat.PITCH,
        startsAt: new Date("2027-01-31T14:00:00+05:30"),
        endsAt: new Date("2027-01-31T16:30:00+05:30"),
        room: "TBA", // TODO: confirm with organisers
        isPublished: false,
        sortOrder: 2,
      },
      {
        editionId: edition2027.id,
        title: "Office hours",
        slug: "office-hours",
        description:
          "Faculty, alumni, operators. Speakers to be announced. TODO: confirm with organisers.",
        format: SessionFormat.NETWORKING,
        startsAt: new Date("2027-01-31T17:00:00+05:30"),
        endsAt: new Date("2027-01-31T18:30:00+05:30"),
        room: "TBA", // TODO: confirm with organisers
        isPublished: false,
        sortOrder: 3,
      },
    ],
  });

  await prisma.speaker.create({
    data: {
      editionId: edition2027.id,
      name: "To be announced",
      title: "Keynote — TBA",
      organisation: "TODO: confirm with organisers",
      bio: "Speaker slots are correctly shown as to be announced.",
      isKeynote: true,
      isPublished: false,
      sortOrder: 0,
    },
  });

  await prisma.page.createMany({
    data: [
      {
        editionId: edition2027.id,
        slug: "about",
        title: "About",
        body: "TODO: confirm with organisers — about page body.",
        isPublished: false,
      },
      {
        editionId: edition2027.id,
        slug: "travel",
        title: "Travel",
        body: `Venue: ${VENUE_ADDRESS}\n\nPartners on campus include [E-Cell](https://ecell.in) and [SINE](https://sineiitb.org).\n\nTODO: confirm with organisers — travel details.`,
        isPublished: false,
      },
      {
        editionId: edition2027.id,
        slug: "code-of-conduct",
        title: "Code of conduct",
        body: "TODO: confirm with organisers — code of conduct draft.",
        isPublished: false,
      },
      {
        editionId: edition2027.id,
        slug: "privacy",
        title: "Privacy",
        body: "TODO: confirm with organisers — privacy policy draft.",
        isPublished: false,
      },
    ],
  });

  await prisma.faq.createMany({
    data: [
      {
        editionId: edition2027.id,
        question: "When is INVENT 2027?",
        answer: "Sunday 31 January 2027, Asia/Kolkata.",
        sortOrder: 0,
        isPublished: true,
      },
      {
        editionId: edition2027.id,
        question: "Where is it held?",
        answer: VENUE_ADDRESS,
        sortOrder: 1,
        isPublished: true,
      },
      {
        editionId: edition2027.id,
        question: "How do I get notified?",
        answer:
          "Use the notify CTA when registration opens. TODO: confirm with organisers — deadlines other than 31 Jan 2027 are placeholders.",
        sortOrder: 2,
        isPublished: true,
      },
    ],
  });

  console.log("Seeded:");
  console.log(`  • Admin: ${ADMIN_EMAIL} (ADMIN) — only ADMIN_EMAILS may access /admin`);
  console.log(`  • ${edition2026.name} (${edition2026.status}, isCurrent=${edition2026.isCurrent})`);
  console.log(`  • ${edition2027.name} (${edition2027.status}, isCurrent=${edition2027.isCurrent})`);
  console.log(`  • Venue: ${VENUE_ADDRESS}`);
  console.log("  • Placeholder stats/programme flagged TODO: confirm with organisers");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
