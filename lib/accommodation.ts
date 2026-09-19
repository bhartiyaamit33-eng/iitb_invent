/** Stay options for IITB INV.ENT. Keep facts aligned with the hotel quote and guest-house note. */

export const GUEST_HOUSE = {
  title: "IIT Bombay guest houses",
  summary:
    "Limited rooms on campus, twin sharing, first-come first-served. Guests pay for their stay.",
  points: [
    {
      title: "Twin sharing",
      body: "Rooms are allocated on a twin-sharing basis.",
    },
    {
      title: "First come, first served",
      body: "Places are limited. Allocation follows the order requests are received.",
    },
    {
      title: "Guests pay",
      body: "The conference does not cover guest-house charges. You pay for your own stay.",
    },
  ],
} as const;

export const ANANTHA = {
  name: "Anantha Hotel",
  brand: "Anantha Executive Suites",
  contactName: "Anupama Dalvi",
  addressLines: [
    "Near 'S' Ward, BMC Office, LBS Marg",
    "Bhandup West, Mumbai 400078",
  ],
  phones: [
    { display: "+91-7506333242", href: "tel:+917506333242" },
    { display: "+91-7506333244", href: "tel:+917506333244" },
  ],
  email: "bookings@ananthahotels.com",
  mapsUrl:
    "https://www.google.com/maps/place/anantha+hotel+bhandup/data=!4m2!3m1!1s0x3be7b8765bb9d5b9:0x5aa98ad4ba2fa21d?sa=X&ved=1t:242&ictx=111",
  photo: {
    src: "/assets/accommodation/anantha-executive-suites.jpg",
    width: 1024,
    height: 682,
    alt: "Anantha Executive Suites on LBS Marg, Bhandup West, Mumbai",
  },
  gstNote: "5% GST applicable. Breakfast and Wi-Fi complimentary.",
  bookingNote:
    "Book directly with the hotel. Mention IITB INV.ENT when you write or call, and confirm the quoted rate and availability.",
} as const;

export const ANANTHA_RATES = [
  {
    room: "Executive SGL / DBL",
    tariff: 5000,
    single: 4000,
    double: 4500,
  },
  {
    room: "Deluxe SGL / DBL",
    tariff: 6000,
    single: 5000,
    double: 5500,
  },
  {
    room: "Anantha Deluxe SGL / DBL",
    tariff: 7000,
    single: 6000,
    double: 6500,
  },
] as const;

export function inr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
