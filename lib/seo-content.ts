/** Canonical copy for SEO / GEO / AEO. Keep facts aligned with the landing page. */

export const INVENT_DEFINITION =
  "IITB INV.ENT is an entrepreneurship research and practice conference conducted by the Desai Sethi School of Entrepreneurship, IIT Bombay. People meet, network, attend sessions, workshops, and events, get exposure to research across the entrepreneurship ecosystem, and hear talks on entrepreneurship in practice and venture building. The 2027 edition is on 30-31 January at the DSSE Building, Powai, Mumbai.";

export const DSSE_DEFINITION =
  "DSSE is the Desai Sethi School of Entrepreneurship at the Indian Institute of Technology Bombay (IIT Bombay, IITB) in Powai, Mumbai. The school trains aspiring entrepreneurs through academic and pre-incubation programmes.";

export type FaqItem = { question: string; answer: string };

export const CANONICAL_FAQS: FaqItem[] = [
  {
    question: "What is IITB INV.ENT?",
    answer:
      "IITB INV.ENT is an entrepreneurship research and practice conference conducted by the Desai Sethi School of Entrepreneurship, IIT Bombay. People meet, network, attend sessions, workshops, and events, see research from the entrepreneurship ecosystem, and hear talks on actual entrepreneurship and venture practice. The official website is https://iitbinvent.com.",
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
      "IITB INV.ENT is a two-day conference on campus, 30-31 January. People meet and network, attend sessions, workshops, and events, get exposure to entrepreneurship research, and hear talks on entrepreneurship in practice, including venture pitches.",
  },
  {
    question: "How is IITB INV.ENT related to IIT Bombay, E-Cell, and SINE?",
    answer:
      "IITB INV.ENT is conducted by DSSE at IIT Bombay. E-Cell and SINE are campus partners in IIT Bombay's entrepreneurship stack. IITB INV.ENT is not a replacement for those organisations.",
  },
];

export const ABOUT_SECTIONS: { heading: string; body: string }[] = [
  {
    heading: "What IITB INV.ENT is for",
    body: "IITB INV.ENT exists so ideas do not die in labs. It is an entrepreneurship research and practice conference where students, faculty, founders, investors, and operators meet, network, attend sessions, workshops, and events, see research from the entrepreneurship ecosystem, and hear talks on entrepreneurship in practice and venture building.",
  },
  {
    heading: "Who it is for",
    body: "Student and faculty founders. Researchers working on lab-to-market. Alumni who mentor. Investors and operators who open doors. Anyone building something India needs, and willing to meet the people doing the same on the IIT Bombay campus.",
  },
  {
    heading: "The school",
    body: "On 31 January 2014, IIT Bombay's Board of Governors approved what became DSSE. IITB INV.ENT is conducted by the Desai Sethi School of Entrepreneurship at IIT Bombay, where entrepreneurship research meets venture practice.",
  },
  {
    heading: "IITB INV.ENT 2027",
    body: "The current edition is IITB INV.ENT 2027, on 30-31 January 2027 at the DSSE Building, IIT Bombay, Powai, Mumbai, with sessions from about 9:00 to 19:30 IST. Log in, submit a paper or poster abstract, and complete your profile. An account is not a ticket.",
  },
];

export const TRAVEL_FALLBACK = `Venue: Desai Sethi School of Entrepreneurship · DSSE Building · IIT Bombay · Powai, Mumbai 400076.

IITB INV.ENT is an on-campus conference. The nearest landmark is IIT Bombay, Powai. Use the institute's public directions to the Main Gate, then follow signage to the DSSE Building.

If you are flying in, Chhatrapati Shivaji Maharaj International Airport (BOM) is the usual arrival point for Mumbai. From the airport or from central Mumbai, Powai is typically 45 to 90 minutes by car depending on traffic.

Campus access may require a registration badge. Confirm gate instructions closer to 30 January 2027. Queries: support@iitbinvent.com.`;

export const PRIVACY_FALLBACK = `IITB INV.ENT (iitbinvent.com) is run by the Desai Sethi School of Entrepreneurship at IIT Bombay.

You can update or delete profile fields from your dashboard. An account is not a ticket to the event.

Transactional mail is sent from conference@iitbinvent.com. For data requests write to admin@iitbinvent.com or support@iitbinvent.com.`;

export const CONDUCT_FALLBACK = `IITB INV.ENT is a professional academic and venture conference on the IIT Bombay campus.

Harassment, discrimination, or making the room worse for others is not acceptable. Organisers may remove anyone who breaks this standard.

Report issues to support@iitbinvent.com.`;
