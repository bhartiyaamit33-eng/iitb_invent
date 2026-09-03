/** Google Calendar + .ics helpers (Asia/Kolkata event times stored as Date). */

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Format as UTC for ICS / Google (YYYYMMDDTHHMMSSZ). */
export function toUtcStamp(d: Date): string {
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

export function googleCalendarUrl(opts: {
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt: Date;
  endsAt: Date;
}): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${toUtcStamp(opts.startsAt)}/${toUtcStamp(opts.endsAt)}`,
  });
  if (opts.description) params.set("details", opts.description);
  if (opts.location) params.set("location", opts.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcs(opts: {
  uid: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt: Date;
  endsAt: Date;
}): string {
  const escape = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//INVENT IIT Bombay//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${opts.uid}@iitbinvent.com`,
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `DTSTART:${toUtcStamp(opts.startsAt)}`,
    `DTEND:${toUtcStamp(opts.endsAt)}`,
    `SUMMARY:${escape(opts.title)}`,
  ];
  if (opts.description) lines.push(`DESCRIPTION:${escape(opts.description)}`);
  if (opts.location) lines.push(`LOCATION:${escape(opts.location)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}
