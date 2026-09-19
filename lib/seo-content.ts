/** Canonical copy for SEO / GEO / AEO. Keep facts aligned with the landing page. */

export const INVENT_DEFINITION =
  "IITB INV.ENT is an entrepreneurship research and practice conference run by the Desai Sethi School of Entrepreneurship at IIT Bombay. Researchers present work. Practitioners say what they are actually up against. Incubators, investors and student founders sit in the same sessions. The 2027 edition is on 30-31 January at the DSSE Building, Powai, Mumbai.";

export const DSSE_DEFINITION =
  "DSSE is the Desai Sethi School of Entrepreneurship at the Indian Institute of Technology Bombay (IIT Bombay, IITB) in Powai, Mumbai. The school trains aspiring entrepreneurs through academic and pre-incubation programmes.";

export type FaqItem = { question: string; answer: string };

export const CANONICAL_FAQS: FaqItem[] = [
  {
    question: "What is IITB INV.ENT?",
    answer:
      "IITB INV.ENT is an entrepreneurship research and practice conference run by the Desai Sethi School of Entrepreneurship at IIT Bombay. Researchers present work; practitioners say what they are actually up against. Incubators, investors and student founders sit in the same sessions. Official site: https://iitbinvent.com.",
  },
  {
    question: "What does DSSE stand for?",
    answer:
      "DSSE stands for the Desai Sethi School of Entrepreneurship, a school of IIT Bombay. Official site: https://www.dsse.iitb.ac.in/.",
  },
  {
    question: "When is IITB INV.ENT 2027?",
    answer:
      "IITB INV.ENT 2027 is on 30-31 January 2027 at the DSSE Building, IIT Bombay. Doors open from 9:00 IST; sessions run through about 19:30 IST, Asia/Kolkata.",
  },
  {
    question: "Where is IITB INV.ENT held?",
    answer:
      "At the DSSE Building, Desai Sethi School of Entrepreneurship, IIT Bombay, Powai, Mumbai 400076, India.",
  },
  {
    question: "Who organises IITB INV.ENT?",
    answer:
      "IITB INV.ENT is conducted by the Desai Sethi School of Entrepreneurship (DSSE) at IIT Bombay. Campus partners include E-Cell (ecell.in) and SINE (sineiitb.org). Queries: support@iitbinvent.com.",
  },
  {
    question: "How do I register for IITB INV.ENT?",
    answer:
      "Log in at https://iitbinvent.com/login, then submit a paper or poster abstract. An account is not a ticket. Organisers review submissions and write to you with next steps. The ticket then appears on your dashboard and in email.",
  },
  {
    question: "What happens at IITB INV.ENT?",
    answer:
      "30 January is a pre-conference day with hands-on workshops on entrepreneurship education, including a teaching workshop. 31 January is the conference: research papers and posters, startup pitches, conversations with venture capitalists, incubators and mentors, and Best Paper and Best Poster awards. Doors open at 9:00 IST; the day runs to about 19:30.",
  },
  {
    question: "Is there a pre-conference workshop at IITB INV.ENT?",
    answer:
      "Yes. A working session on teaching entrepreneurship, led by Prof. Sankalp Pratap, Associate Professor at DSSE, IIT Bombay, runs on 30 January 2027 at the DSSE Building. It is included in conference registration. Reserve a seat from your dashboard after registration is confirmed. Details: https://iitbinvent.com/workshops",
  },
  {
    question: "Where can I stay for IITB INV.ENT?",
    answer:
      "Limited twin-sharing rooms at the IIT Bombay guest houses are first-come first-served; guests pay. Anantha Hotel in Bhandup West has quoted discounted rates for delegates. Details: https://iitbinvent.com/accommodation",
  },
  {
    question: "How is IITB INV.ENT related to IIT Bombay, E-Cell, and SINE?",
    answer:
      "IITB INV.ENT is conducted by DSSE at IIT Bombay. E-Cell and SINE are campus partners in IIT Bombay's entrepreneurship stack. IITB INV.ENT is not a replacement for those organisations.",
  },
  {
    question: "How do I contact IITB INV.ENT?",
    answer:
      "Write to support@iitbinvent.com. One inbox for press, partners, speakers, volunteers, campus access, and other queries. Humans read it. Address: Desai Sethi School of Entrepreneurship, DSSE Building, IIT Bombay, Powai, Mumbai 400076. Contact page: https://iitbinvent.com/contact",
  },
];

export const CONTACT_EMAIL = "support@iitbinvent.com";

export const CONTACT_PAGE = {
  kicker: "IITB INV.ENT · DSSE · IIT Bombay",
  title: "Contact",
  heading: "Queries",
  body: 'Press, partners, speakers, volunteers, campus access, or “I have a company and a problem.” One inbox. Humans read it.',
} as const;

export const ABOUT_PAGE = {
  kicker: "IIT Bombay · DSSE",
  title: "About IITB INV.ENT",
  lede: [
    "Entrepreneurship is studied, and entrepreneurship is practised, and the two almost never sit in the same room.",
    "Papers get written about founders by people who have never raised a round. Companies get built by people who would be helped enormously by the evidence and will never read it. Both halves are working on the same problem. Neither has the other's notes.",
    "IITB INV.ENT is our attempt to fix that for two days a year.",
    "It is an entrepreneurship research and practice conference, run by the [Desai Sethi School of Entrepreneurship](https://www.dsse.iitb.ac.in/) at IIT Bombay. Researchers present work. Practitioners say what they are actually up against. Incubators, investors and student founders sit in the same sessions rather than in a parallel track down the corridor. Nobody has to pretend the other half of the room is not there.",
    "That is the whole idea. Everything else on this page is detail.",
  ],
  sections: [
    {
      heading: "Where this comes from",
      paragraphs: [
        "IIT Bombay started thinking about this in 2010: a dedicated centre to teach innovation and entrepreneurship, with the content, the context and the contacts to go with it.",
        "It took shape in 2014, when Bharat Desai, an electrical engineering graduate of the Institute from the class of 1975, and Neerja Sethi gave one million dollars to start the Centre. The Board of Governors approved the Desai Sethi Centre for Entrepreneurship on 31 January 2014. In December 2019 the Board approved its conversion into a School.",
        "The first year was two courses and about 300 students. Twenty courses later, and one purpose-built building later, DSSE has trained more than 5,550 students, mentored more than 1,470, seen over 670 venture teams form and 127 startups actually get started.",
        "Behind those numbers is something fairly unglamorous. Someone sat with a twenty-year-old and asked what problem they were solving, and asked again the next week, and the week after, until either the idea got sharper or the student worked out it was not a business. Most of the work is that. The 127 are what is left standing.",
      ],
    },
    {
      heading: "What an idea runs into here",
      paragraphs: [
        "This conference is not an abstract proposal about bringing research and practice together. At IIT Bombay the two are already stacked on top of each other, and DSSE sits in the middle of the stack.",
        "Upstream, the ideas arrive on their own. [E-Cell](https://ecell.in) has been running since 1998, and its annual E-Summit pulls in more than 30,000 students, founders, investors and business leaders, alongside Eureka!, one of the largest business plan competitions anywhere. The Institute Technical Council runs the teams that build things for real: a Mars rover, a racing car, an autonomous underwater vehicle, the Pratham satellite, Team Shunya's net-zero housing. Then there are the research labs and Centres of Excellence, in healthcare informatics, green energy, climate, electric mobility, drone technology, AI and data sciences. BETIC alone has catalogued 450 unmet clinical needs, filed 55 patents, developed 25 devices and incubated 16 startups.",
        "In the middle, DSSE turns some of that into ventures. Twenty courses, up from six in 2022. A Minor in Entrepreneurship. An introductory course every first-year undergraduate takes. Courses on NPTEL and Coursera for students who are nowhere near Powai. And since 2024, a PhD programme in innovation and entrepreneurship whose first cohort came from engineering, social sciences, finance and management, working on entrepreneurship education, lab-to-market translation, inclusive innovation and social entrepreneurship.",
        "Alongside the teaching are the pre-incubation programmes. IDEAS takes early-stage ventures through structured cohorts. WiE, Women in Entrepreneurship, does the same with its own focus. And from November 2025, the IITB–Groww INV.ENT Program: a four-year commitment with Groww Foundation, a 15,000 square foot innovation space inside the DSSE building, and support for around 420 teams. Track A gives roughly a hundred teams a year a small grant and six months to find out whether the thing works. Track B takes five teams a year, up to ₹25 lakh in milestone-based funding, a faculty mentor and alumni advisors, and points them at formal incubation.",
        "Downstream, [SINE](https://sineiitb.org) takes over. IIT Bombay's technology business incubator, a DST Centre of Excellence, offering start-to-scale support. Ventures that survive pre-incubation go there.",
        "And some of them get out. Khatabook. Manastu Space. NeoDocs. Rephrase.ai. Proactive For Her. Ushva CleanTech. CareMother.",
        "That is the pipeline an idea runs through here, from a club on the infinite corridor to a term sheet. IITB INV.ENT is where the people at every stage of it stand in the same room for two days, and where researchers from outside IIT Bombay get to put their work in front of all of them at once.",
      ],
    },
    {
      heading: "The building",
      paragraphs: [
        "DSSE has its own six-storey building on campus, and the way it is laid out says something about what we think entrepreneurship education is.",
        "A maker space and a tinkerers' lab, because people who build things need somewhere to build them badly first. A proof-of-concept lab with CNC machines, laser cutters and 3D printers. A pre-incubation centre, co-working floors, studios and innovation labs. Classrooms. Room set aside for student startup teams who need a desk and a door. And now 15,000 square feet of it given over to the Groww programme.",
        "It works as a sandbox. You can walk from a seminar on opportunity recognition to a bench where somebody is failing at a prototype in about ninety seconds. That proximity is not decorative. It is the argument.",
      ],
    },
    {
      heading: "Foundation Day, and how it turned into this",
      paragraphs: [
        "Every 31 January, DSSE marks its Foundation Day, the date the Board approved it in 2014.",
        "For years this was an internal affair. Then we started opening it out. In 2025 the Entrepreneurship Day symposium, Catalysing University Entrepreneurship, drew more than 300 people, and a research workshop on contemporary entrepreneurship followed weeks later. It became clear the day worked better as a meeting point between the academic world and the practice world than as a celebration of ourselves.",
        "Researchers presented to practitioners and got questions they do not get at academic conferences. Practitioners met researchers and found somebody had already studied the thing keeping them awake. IITB INV.ENT 2027 carries that forward, now across two days.",
      ],
    },
    {
      heading: "What happens, 30 and 31 January 2027",
      paragraphs: [
        "30 January — pre-conference day. Hands-on workshops on entrepreneurship education and related themes, including the [pre-conference teaching workshop](/workshops).",
        "31 January — the conference. Research paper and poster presentations. Startup pitches. Open conversations with venture capitalists, incubators and mentors. Best Paper and Best Poster awards. Selected papers carry publication opportunities.",
        "Doors open at 9:00 IST. The day runs to about 19:30.",
      ],
    },
    {
      heading: "Who this is for",
      paragraphs: [
        "Faculty and doctoral scholars working on entrepreneurship, innovation and strategy. Mentors and incubation teams. Founders, including the ones who think academic research has nothing to say to them, who we would particularly like to argue with. Investors and operators who can open a door. Students who want to work in any of this.",
        "You do not need to be presenting to attend.",
      ],
    },
    {
      heading: "What we are trying to build",
      paragraphs: [
        "Every part of the ecosystem described above already exists at IIT Bombay, and almost all of it runs without ever producing a paper. Meanwhile the research on entrepreneurship in India is thin in exactly the places where this campus has twelve years of evidence sitting in filing cabinets and cohort reports.",
        "IITB INV.ENT exists to close that loop. We want the conference to be the place where what happens on campuses like this one gets studied properly, and where the studying gets held to the standard of people who have actually done it. Where a paper has to survive a founder's questions and a pitch has to survive a researcher's.",
        "[Come and help us build it.](/contact)",
      ],
    },
  ],
} as const;

export const TRAVEL_FALLBACK = `Venue: Desai Sethi School of Entrepreneurship · DSSE Building · IIT Bombay · Powai, Mumbai 400076.

IITB INV.ENT is an on-campus conference. The nearest landmark is IIT Bombay, Powai. Use the institute's public directions to the Main Gate, then follow signage to the DSSE Building.

If you are flying in, Chhatrapati Shivaji Maharaj International Airport (BOM) is the usual arrival point for Mumbai. From the airport or from central Mumbai, Powai is typically 45 to 90 minutes by car depending on traffic.

Campus access may require a registration badge. Confirm gate instructions closer to 30 January 2027.

Stay: limited twin-sharing rooms at the IIT Bombay guest houses (first-come first-served, guests pay), and discounted rates at Anantha Hotel, Bhandup West. See [Accommodation](/accommodation). Queries: support@iitbinvent.com.`;

export const PRIVACY_FALLBACK = `IITB INV.ENT (iitbinvent.com) is run by the Desai Sethi School of Entrepreneurship at IIT Bombay.

You can update or delete profile fields from your dashboard. An account is not a ticket to the event.

Transactional mail is sent from conference@iitbinvent.com. For data requests write to admin@iitbinvent.com or support@iitbinvent.com.`;

export const CONDUCT_FALLBACK = `IITB INV.ENT is a professional academic and venture conference on the IIT Bombay campus.

Harassment, discrimination, or making the room worse for others is not acceptable. Organisers may remove anyone who breaks this standard.

Report issues to support@iitbinvent.com.`;
