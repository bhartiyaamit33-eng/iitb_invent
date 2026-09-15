/** Canonical copy for SEO / GEO / AEO. Keep facts aligned with the landing page. */

export const INVENT_DEFINITION =
  "INV.ENT is the Entrepreneurship Research and Venture Practice Conference conducted by the Desai Sethi School of Entrepreneurship (DSSE) at IIT Bombay. People meet, network, attend sessions, workshops, and events, get exposure to research across the entrepreneurship ecosystem, and hear talks on entrepreneurship in practice and venture building. The 2027 edition is on 30 and 31 January at the DSSE Building, Powai, Mumbai. 30 January is Day Zero.";

export const DSSE_DEFINITION =
  "DSSE is the Desai Sethi School of Entrepreneurship at the Indian Institute of Technology Bombay (IIT Bombay, IITB) in Powai, Mumbai. The school trains aspiring entrepreneurs through academic and pre-incubation programmes.";

export type FaqItem = { question: string; answer: string };

export const CANONICAL_FAQS: FaqItem[] = [
  {
    question: "What is INV.ENT?",
    answer:
      "INV.ENT is the Entrepreneurship Research and Venture Practice Conference conducted by the Desai Sethi School of Entrepreneurship (DSSE) at IIT Bombay. People meet, network, attend sessions, workshops, and events, see research from the entrepreneurship ecosystem, and hear talks on actual entrepreneurship and venture practice. The official website is https://iitbinvent.com.",
  },
  {
    question: "What does DSSE stand for?",
    answer:
      "DSSE stands for the Desai Sethi School of Entrepreneurship, a school of IIT Bombay. Official site: https://www.dsse.iitb.ac.in/.",
  },
  {
    question: "When is INV.ENT 2027?",
    answer:
      "INV.ENT 2027 is on 30 and 31 January 2027 at the DSSE Building, IIT Bombay. 30 January is Day Zero. 31 January is the conference day. Doors on 31 January open from 9:00 IST; sessions run through about 19:30 IST, Asia/Kolkata.",
  },
  {
    question: "What is Day Zero?",
    answer:
      "Day Zero is 30 January 2027, the opening day of INV.ENT before the main conference programme on 31 January.",
  },
  {
    question: "Where is INV.ENT held?",
    answer:
      "At the DSSE Building, Desai Sethi School of Entrepreneurship, IIT Bombay, Powai, Mumbai 400076, India.",
  },
  {
    question: "Who organises INV.ENT?",
    answer:
      "INV.ENT is conducted by the Desai Sethi School of Entrepreneurship (DSSE) at IIT Bombay. Campus partners include E-Cell (ecell.in) and SINE (sineiitb.org). Queries: support@iitbinvent.com.",
  },
  {
    question: "How do I register for INV.ENT?",
    answer:
      "Create a free account at https://iitbinvent.com/signup, then complete your profile if you want to appear in the attendee directory. Session RSVPs and the programme live at https://iitbinvent.com/programme.",
  },
  {
    question: "What happens at INV.ENT?",
    answer:
      "INV.ENT is a two-day conference on campus. People meet and network, attend sessions, workshops, and events, get exposure to entrepreneurship research, and hear talks on entrepreneurship in practice, including venture pitches. Day Zero is 30 January. The conference day is 31 January.",
  },
  {
    question: "How is INV.ENT related to IIT Bombay, E-Cell, and SINE?",
    answer:
      "INV.ENT is conducted by DSSE at IIT Bombay. E-Cell and SINE are campus partners in IIT Bombay's entrepreneurship stack. INV.ENT is not a replacement for those organisations.",
  },
];

export const ABOUT_SECTIONS: { heading: string; body: string }[] = [
  {
    heading: "What INV.ENT is for",
    body: "INV.ENT exists so ideas do not die in labs. It is a conference where students, faculty, founders, investors, and operators meet, network, attend sessions, workshops, and events, see research from the entrepreneurship ecosystem, and hear talks on entrepreneurship in practice and venture building.",
  },
  {
    heading: "Who it is for",
    body: "Student and faculty founders. Researchers working on lab-to-market. Alumni who mentor. Investors and operators who open doors. Anyone building something India needs, and willing to meet the people doing the same on the IIT Bombay campus.",
  },
  {
    heading: "The school",
    body: "On 31 January 2014, IIT Bombay's Board of Governors approved what became DSSE. INV.ENT is conducted by the Desai Sethi School of Entrepreneurship at IIT Bombay, where entrepreneurship research meets venture practice.",
  },
  {
    heading: "INV.ENT 2027",
    body: "The current edition is INV.ENT 2027, on 30 and 31 January 2027 at the DSSE Building, IIT Bombay, Powai, Mumbai. 30 January is Day Zero. 31 January is the conference day, with sessions from about 9:00 to 19:30 IST. Create an account to join the directory, browse the programme, and add a startup, project, or idea.",
  },
];

export const TRAVEL_FALLBACK = `Venue: Desai Sethi School of Entrepreneurship · DSSE Building · IIT Bombay · Powai, Mumbai 400076.

INV.ENT is an on-campus conference. The nearest landmark is IIT Bombay, Powai. Use the institute's public directions to the Main Gate, then follow signage to the DSSE Building.

If you are flying in, Chhatrapati Shivaji Maharaj International Airport (BOM) is the usual arrival point for Mumbai. From the airport or from central Mumbai, Powai is typically 45 to 90 minutes by car depending on traffic.

Campus access may require a registration badge. Confirm gate instructions closer to 30 January 2027. Queries: support@iitbinvent.com.`;

export const PRIVACY_FALLBACK = `INV.ENT (iitbinvent.com) is run by the Desai Sethi School of Entrepreneurship at IIT Bombay.

The attendee directory is opt-in. Email is never shown to other attendees unless you enable that in your profile. You can update or delete profile fields from your dashboard.

Transactional mail is sent from conference@iitbinvent.com. For data requests write to admin@iitbinvent.com or support@iitbinvent.com.`;

export const CONDUCT_FALLBACK = `INV.ENT is a professional academic and venture conference on the IIT Bombay campus.

Harassment, discrimination, or making the room worse for others is not acceptable. Organisers may remove anyone who breaks this standard.

Report issues to support@iitbinvent.com.`;
