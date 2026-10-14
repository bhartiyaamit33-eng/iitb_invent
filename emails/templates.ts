/**
 * Transactional emails for IITB INV.ENT.
 *
 * One shell for every message: a navy masthead with the wordmark and event
 * dates, a white card, and a footer with the venue and support address. Built
 * from tables with inline styles, which is what renders the same in Gmail,
 * Outlook, Apple Mail and phone clients. No images, so nothing breaks when a
 * client blocks them.
 */
import { siteOrigin } from "@/lib/ticket";

const BRAND = "IITB INV.ENT";
const EMAIL_BRAND = "IIT Bombay INV.ENT";
const CONFERENCE_NAME = "Entrepreneurship Research and Venture Practice Conference";
const EVENT_DATES = "30–31 January 2027";
const VENUE = "Desai Sethi School of Entrepreneurship, IIT Bombay, Powai, Mumbai 400076";
const SUPPORT = "support@iitbinvent.com";

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
const C = {
  navy: "#14213d",
  ink: "#14213d",
  text: "#3b4a63",
  mute: "#5f6b82",
  rule: "#dce1e8",
  canvas: "#f3f5f8",
  blue: "#145bef",
  blueInk: "#0e45bb",
};

type Tone = "good" | "warn" | "info" | "neutral";
const TONES: Record<Tone, { fg: string; bg: string }> = {
  good: { fg: "#1c7341", bg: "#e5f3ea" },
  warn: { fg: "#8a5300", bg: "#fcf0da" },
  info: { fg: "#0e45bb", bg: "#eaf0fe" },
  neutral: { fg: "#4f5b70", bg: "#edf0f4" },
};

type Email = { subject: string; html: string; text: string };

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function blank(value: string): string {
  return value.trim() ? value : "Not provided";
}

// ─── Building blocks ─────────────────────────────────────────────────────────

function para(html: string, extra = ""): string {
  return `<p style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:1.65;color:${C.text};${extra}">${html}</p>`;
}

function paragraphs(text: string): string {
  return text
    .trim()
    .split(/\n{2,}/)
    .map((p) => para(escapeHtml(p).replace(/\n/g, "<br/>")))
    .join("");
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 14px;font-family:${FONT};font-size:24px;line-height:1.25;font-weight:700;letter-spacing:-0.01em;color:${C.ink};">${escapeHtml(text)}</h1>`;
}

function subheading(text: string): string {
  return `<h2 style="margin:8px 0 8px;font-family:${FONT};font-size:16px;line-height:1.35;font-weight:700;color:${C.ink};">${escapeHtml(text)}</h2>`;
}

function label(text: string, tone: Tone): string {
  const t = TONES[tone];
  return `<p style="margin:0 0 14px;"><span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${t.bg};color:${t.fg};font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:0.02em;">${escapeHtml(text)}</span></p>`;
}

/** Label/value rows; `strong` rows render the value larger, e.g. an amount. */
function details(rows: { label: string; value: string; strong?: boolean; html?: boolean }[]): string {
  const body = rows
    .map((r, i) => {
      const border = i === 0 ? "" : `border-top:1px solid ${C.rule};`;
      const value = r.html ? r.value : escapeHtml(r.value);
      return `<tr>
        <td valign="top" style="${border}padding:11px 16px 11px 0;width:38%;font-family:${FONT};font-size:13px;line-height:1.5;color:${C.mute};">${escapeHtml(r.label)}</td>
        <td valign="top" style="${border}padding:11px 0;font-family:${FONT};font-size:${r.strong ? "20px" : "14px"};line-height:1.5;font-weight:${r.strong ? 700 : 500};color:${C.ink};word-break:break-word;">${value}</td>
      </tr>`;
    })
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:4px 0 22px;border-top:1px solid ${C.rule};border-bottom:1px solid ${C.rule};">${body}</table>`;
}

/** A button that holds its shape in Outlook too, optionally with the raw link underneath. */
function button(href: string, text: string, withFallback = true): string {
  const safe = escapeHtml(href);
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 ${withFallback ? "12px" : "22px"};">
    <tr><td align="center" bgcolor="${C.blue}" style="border-radius:8px;">
      <a href="${safe}" target="_blank" style="display:inline-block;padding:13px 24px;font-family:${FONT};font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">${escapeHtml(text)}</a>
    </td></tr>
  </table>${
    withFallback
      ? `<p style="margin:0 0 22px;font-family:${FONT};font-size:12px;line-height:1.6;color:${C.mute};word-break:break-all;">If the button does not work, open this link:<br/><a href="${safe}" style="color:${C.blueInk};">${safe}</a></p>`
      : ""
  }`;
}

function note(title: string, html: string, tone: Tone = "neutral"): string {
  const accent =
    tone === "warn" ? "#c98a1b" : tone === "good" ? TONES.good.fg : tone === "info" ? C.blue : C.rule;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 20px;">
    <tr><td style="padding:14px 16px;background:${C.canvas};border-left:3px solid ${accent};border-radius:4px;font-family:${FONT};font-size:13.5px;line-height:1.6;color:${C.text};">
      <strong style="display:block;margin-bottom:4px;color:${C.ink};">${escapeHtml(title)}</strong>${html}
    </td></tr>
  </table>`;
}

function link(href: string, text: string): string {
  return `<a href="${escapeHtml(href)}" style="color:${C.blueInk};font-weight:600;">${escapeHtml(text)}</a>`;
}

/** The shell around every email. `preheader` is the grey preview line in the inbox. */
function layout(preheader: string, body: string): string {
  const site = siteOrigin();
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light only" />
<meta name="supported-color-schemes" content="light" />
<title>${escapeHtml(BRAND)}</title>
</head>
<body style="margin:0;padding:0;width:100%;background:${C.canvas};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${C.canvas};">${escapeHtml(preheader)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${C.canvas};">
  <tr><td align="center" style="padding:28px 12px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;max-width:600px;">
      <tr><td style="padding:22px 28px;background:${C.navy};border-radius:12px 12px 0 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
          <td style="font-family:${FONT};font-size:22px;font-weight:800;letter-spacing:-0.01em;color:#ffffff;">INV<span style="color:#5e8bff;">.</span>ENT</td>
          <td align="right" style="font-family:${FONT};font-size:12px;line-height:1.5;color:#c9d3e6;">IIT Bombay<br/>${escapeHtml(EVENT_DATES)}</td>
        </tr></table>
        <div style="margin-top:6px;font-family:${FONT};font-size:12.5px;line-height:1.5;color:#c9d3e6;">${escapeHtml(CONFERENCE_NAME)}</div>
      </td></tr>
      <tr><td style="padding:32px 28px 12px;background:#ffffff;border-left:1px solid ${C.rule};border-right:1px solid ${C.rule};">
        ${body}
      </td></tr>
      <tr><td style="padding:18px 28px 22px;background:#ffffff;border:1px solid ${C.rule};border-radius:0 0 12px 12px;font-family:${FONT};font-size:12px;line-height:1.7;color:${C.mute};">
        <strong style="color:${C.ink};">${escapeHtml(EMAIL_BRAND)}</strong><br/>
        ${escapeHtml(VENUE)}<br/>
        Questions? Write to ${link(`mailto:${SUPPORT}`, SUPPORT)}. This is an automated message.<br/>
        <a href="${escapeHtml(site)}" style="color:${C.mute};">${escapeHtml(site.replace(/^https?:\/\//, ""))}</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function textFooter(): string {
  return `--\n${EMAIL_BRAND}\n${VENUE}\nQuestions: ${SUPPORT}`;
}

const CONFERENCE_PHRASE =
  "an entrepreneurship research and practice conference conducted by the Desai Sethi School of Entrepreneurship, IIT Bombay";

function submissionLead(participation: string): { title: string; subject: string; thanks: string } {
  switch (participation) {
    case "PAPER_ONLY":
    case "Paper Presentation Only":
      return {
        title: "Your paper is with the committee",
        subject: `We have your paper submission · ${EMAIL_BRAND}`,
        thanks: `Thank you for submitting your paper for presentation at ${EMAIL_BRAND}, ${CONFERENCE_PHRASE}.`,
      };
    case "POSTER_ONLY":
    case "Poster Presentation only":
      return {
        title: "Your poster is with the committee",
        subject: `We have your poster submission · ${EMAIL_BRAND}`,
        thanks: `Thank you for submitting your poster for presentation at ${EMAIL_BRAND}, ${CONFERENCE_PHRASE}.`,
      };
    case "PAPER_OR_POSTER":
    case "Paper or Poster Presentations":
      return {
        title: "Your submission is with the committee",
        subject: `We have your submission · ${EMAIL_BRAND}`,
        thanks: `Thank you for sending in your work to present as a paper or a poster at ${EMAIL_BRAND}, ${CONFERENCE_PHRASE}.`,
      };
    default:
      return {
        title: "Your registration is with the committee",
        subject: `We have your registration · ${EMAIL_BRAND}`,
        thanks: `Thank you for registering for ${EMAIL_BRAND}, ${CONFERENCE_PHRASE}.`,
      };
  }
}

// ─── Account ─────────────────────────────────────────────────────────────────

export function accountCreatedEmail(opts: {
  name: string;
  editionName?: string | null;
  dashboardUrl: string;
  applyUrl?: string;
  ticketCode?: string | null;
  eventDate?: string | null;
}): Email {
  const subject = `Your account is ready · ${EMAIL_BRAND}`;
  const applyUrl = opts.applyUrl || opts.dashboardUrl;
  const html = layout(
    "Next, complete your registration for the conference.",
    `${heading("Your account is ready")}
     ${para(`Hi ${escapeHtml(opts.name)},`)}
     ${para(`Welcome to ${escapeHtml(EMAIL_BRAND)}. An account is not yet a place at the conference: the next step is to complete your registration.`)}
     ${button(applyUrl, "Complete registration", false)}
     ${note(
       "How registration works",
       "Attendees receive a proforma invoice by email and pay right away.<br/>Paper and poster presenters add an extended abstract; once the committee shortlists it, the proforma invoice follows.<br/>Your ticket is issued as soon as the fee is paid.",
       "info",
     )}
     ${para(`You can return to your registration any time from your ${link(opts.dashboardUrl, "dashboard")}.`, "font-size:14px;")}`,
  );
  const text = `Hi ${opts.name},

Welcome to ${EMAIL_BRAND}. An account is not yet a place at the conference: the next step is to complete your registration.

Complete registration: ${applyUrl}

How registration works:
- Attendees receive a proforma invoice by email and pay right away.
- Paper and poster presenters add an extended abstract; once the committee shortlists it, the proforma invoice follows.
- Your ticket is issued as soon as the fee is paid.

Dashboard: ${opts.dashboardUrl}

${textFooter()}`;
  return { subject, html, text };
}

export function profileConfirmationEmail(opts: { name: string; isFirstSave: boolean }): Email {
  const subject = opts.isFirstSave
    ? `Your ${EMAIL_BRAND} profile is ready`
    : `Your ${EMAIL_BRAND} profile was updated`;
  const lead = opts.isFirstSave
    ? `Thanks for setting up your ${EMAIL_BRAND} profile. You can change it any time from your dashboard.`
    : `We saved the changes to your ${EMAIL_BRAND} profile.`;
  const html = layout(
    lead,
    `${heading(opts.isFirstSave ? "Your profile is ready" : "Profile updated")}
     ${para(`Hi ${escapeHtml(opts.name)},`)}
     ${para(escapeHtml(lead))}
     ${button(`${siteOrigin()}/dashboard/profile`, "View your profile", false)}`,
  );
  const text = `Hi ${opts.name},

${lead}

${textFooter()}`;
  return { subject, html, text };
}

export function magicLinkEmail(opts: { name?: string; url: string }): Email {
  const subject = `Your ${EMAIL_BRAND} sign-in link`;
  const html = layout(
    "Your one-time sign-in link.",
    `${heading("Sign in")}
     ${para(opts.name ? `Hi ${escapeHtml(opts.name)},` : "Hello,")}
     ${para("Use this one-time link to sign in. It expires soon.")}
     ${button(opts.url, "Sign in to INV.ENT")}
     ${para("If you did not ask for this, you can ignore this email.", `font-size:13px;color:${C.mute};`)}`,
  );
  const text = `${opts.name ? `Hi ${opts.name},` : "Hello,"}

Use this one-time link to sign in to ${EMAIL_BRAND}. It expires soon:
${opts.url}

If you did not ask for this, ignore this email.

${textFooter()}`;
  return { subject, html, text };
}

export function connectionRequestEmail(opts: {
  toName: string;
  fromName: string;
  fromEmail: string;
  fromPhone?: string | null;
  fromLinkedIn?: string | null;
  fromHeadline?: string | null;
  message: string;
  editionName: string;
}): Email {
  const subject = `${opts.fromName} would like to connect at ${EMAIL_BRAND}`;
  const rows = [
    { label: "Email", value: link(`mailto:${opts.fromEmail}`, opts.fromEmail), html: true },
    ...(opts.fromPhone ? [{ label: "Phone", value: opts.fromPhone }] : []),
    ...(opts.fromLinkedIn ? [{ label: "LinkedIn", value: link(opts.fromLinkedIn, "View profile"), html: true }] : []),
    ...(opts.fromHeadline ? [{ label: "About", value: opts.fromHeadline }] : []),
  ];
  const html = layout(
    `${opts.fromName} asked us to introduce you.`,
    `${heading("An introduction")}
     ${para(`Hi ${escapeHtml(opts.toName)},`)}
     ${para(`<strong style="color:${C.ink};">${escapeHtml(opts.fromName)}</strong>, who is attending ${escapeHtml(EMAIL_BRAND)}, asked us to introduce you. They are not copied on this email.`)}
     ${note("Their message", escapeHtml(opts.message).replace(/\n/g, "<br/>"))}
     ${details(rows)}
     ${para("If you would like to connect, reply to them directly.")}`,
  );
  const text = `Hi ${opts.toName},

${opts.fromName}, who is attending ${EMAIL_BRAND}, asked us to introduce you. They are not copied on this email.

Their message:
${opts.message}

Email: ${opts.fromEmail}
${opts.fromPhone ? `Phone: ${opts.fromPhone}\n` : ""}${opts.fromLinkedIn ? `LinkedIn: ${opts.fromLinkedIn}\n` : ""}${opts.fromHeadline ? `About: ${opts.fromHeadline}\n` : ""}
If you would like to connect, reply to them directly.

${textFooter()}`;
  return { subject, html, text };
}

// ─── Registration ────────────────────────────────────────────────────────────

/** Sent to paper, poster and other presenters when they register; attendees get the proforma instead. */
export function conferenceApplicationCopyEmail(opts: {
  name: string;
  email: string;
  phone: string;
  institution: string;
  professional: string;
  phdYear: string;
  seekingPostdoc: string;
  participation: string;
  paperTitle: string;
  abstractFileName: string;
  eventName: string;
  isPaperOrPoster?: boolean;
  participationCategory?: string;
}): Email {
  const copy = submissionLead(opts.participationCategory || opts.participation);
  const rows = [
    { label: "Name", value: opts.name },
    { label: "Email", value: opts.email },
    { label: "Phone", value: opts.phone },
    { label: "Institution", value: opts.institution },
    { label: "Position", value: opts.professional },
    ...(opts.phdYear && opts.phdYear !== "-" && opts.phdYear !== "Not provided"
      ? [{ label: "PhD year", value: opts.phdYear }]
      : []),
    { label: "Participation", value: opts.participation },
    { label: "Proposed title", value: blank(opts.paperTitle) },
    { label: "Extended abstract", value: opts.abstractFileName || "Not uploaded" },
  ];
  const html = layout(
    "The programme committee will review it and write to you.",
    `${label("Under review", "info")}
     ${heading(copy.title)}
     ${para(`Hi ${escapeHtml(opts.name)},`)}
     ${para(escapeHtml(copy.thanks))}
     ${note(
       "What happens next",
       "The programme committee reviews every submission. If yours is shortlisted, we email your proforma invoice with the registration fee and a payment link. Your ticket is issued once the fee is paid.",
       "info",
     )}
     ${details(rows)}
     ${button(`${siteOrigin()}/register`, "View your registration", false)}`,
  );
  const text = `Hi ${opts.name},

${copy.thanks}

What happens next: the programme committee reviews every submission. If yours is shortlisted, we email your proforma invoice with the registration fee and a payment link. Your ticket is issued once the fee is paid.

${rows.map((r) => `${r.label}: ${r.value}`).join("\n")}

${textFooter()}`;
  return { subject: copy.subject, html, text };
}

/** Internal: tells organisers a registration arrived. */
export function conferenceOrganiserNotifyEmail(opts: {
  name: string;
  email: string;
  institution: string;
  participation: string;
  paperTitle: string;
  eventName: string;
  adminUrl: string;
}): Email {
  const subject = `New registration: ${opts.name}`;
  const html = layout(
    `${opts.name} registered as ${opts.participation}.`,
    `${label("New registration", "neutral")}
     ${heading(opts.name)}
     ${details([
       { label: "Email", value: link(`mailto:${opts.email}`, opts.email), html: true },
       { label: "Institution", value: opts.institution },
       { label: "Participation", value: opts.participation },
       { label: "Proposed title", value: blank(opts.paperTitle) },
     ])}
     ${button(opts.adminUrl, "Open in admin", false)}`,
  );
  const text = `New registration for ${EMAIL_BRAND}

${opts.name} <${opts.email}>
${opts.institution}
${opts.participation}
${blank(opts.paperTitle)}

Open in admin: ${opts.adminUrl}`;
  return { subject, html, text };
}

export function conferenceStatusUpdateEmail(opts: {
  name: string;
  statusLabel: string;
  message: string;
  includePayment: boolean;
  amountLabel: string;
  paymentUrl: string;
  dashboardUrl: string;
  eventName: string;
}): Email {
  const subject = `Update on your registration · ${EMAIL_BRAND}`;
  const html = layout(
    `Your registration status: ${opts.statusLabel}.`,
    `${label(opts.statusLabel, opts.includePayment ? "warn" : "info")}
     ${heading("An update on your registration")}
     ${para(`Hi ${escapeHtml(opts.name)},`)}
     ${paragraphs(opts.message)}
     ${
       opts.includePayment
         ? `${details([{ label: "Amount payable", value: opts.amountLabel, strong: true }])}
            ${button(opts.paymentUrl, "Pay registration fee")}`
         : button(opts.dashboardUrl, "Open your dashboard", false)
     }`,
  );
  const text = `Hi ${opts.name},

${opts.message}

Status: ${opts.statusLabel}
${opts.includePayment ? `Amount payable: ${opts.amountLabel}\nPay: ${opts.paymentUrl}\n` : `Dashboard: ${opts.dashboardUrl}\n`}
${textFooter()}`;
  return { subject, html, text };
}

// ─── Payment ─────────────────────────────────────────────────────────────────

/** Subtotal (the registration fee), GST and total, already formatted (see feeLines). */
export type FeeLines = { fee: string; gst: string; gstPercent: number; total: string };

/** Subtotal, then GST, then total. */
function feeRows(fee: FeeLines) {
  return [
    { label: "Subtotal", value: fee.fee },
    { label: `GST (${fee.gstPercent}%)`, value: fee.gst },
    { label: "Total", value: fee.total, strong: true },
  ];
}

export function proformaInvoiceEmail(opts: {
  name: string;
  payerId: string;
  category: string;
  participation: string;
  fee: FeeLines;
  payUrl: string;
  /** Organiser's note when a shortlisted presenter is asked to pay. */
  message?: string;
}): Email {
  const subject = `Proforma invoice: complete your registration · ${EMAIL_BRAND}`;
  const rows = [
    { label: "Billed to", value: opts.name },
    { label: "Registration ID", value: opts.payerId },
    { label: "Category", value: opts.category },
    { label: "Participation", value: opts.participation },
    { label: "Particulars", value: `Registration fee, ${EMAIL_BRAND} (${EVENT_DATES})` },
    ...feeRows(opts.fee),
  ];
  const html = layout(
    `Total ${opts.fee.total}, including ${opts.fee.gstPercent}% GST. Pay to confirm your place.`,
    `${label("Payment pending", "warn")}
     ${heading("Proforma invoice")}
     ${para(`Hi ${escapeHtml(opts.name)},`)}
     ${opts.message?.trim() ? paragraphs(opts.message) : ""}
     ${para(`Thank you for registering for ${escapeHtml(EMAIL_BRAND)}, ${escapeHtml(CONFERENCE_PHRASE)}. Pay the registration fee below to confirm your place.`)}
     ${details(rows)}
     ${para(`Fees are exclusive of GST; ${opts.fee.gstPercent}% GST is added to the subtotal.`, `margin-top:-12px;font-size:12.5px;color:${C.mute};`)}
     ${button(opts.payUrl, "Pay registration fee")}
     ${note(
       "Before you pay",
       `Choose your mode of payment on the IIT Bombay OnlinePay screen, and keep the tab open until you are returned to the conference site.<br/>
        If money is debited but the payment is not confirmed, do not pay again: write to ${link(`mailto:${SUPPORT}`, SUPPORT)} quoting your registration ID.<br/>
        A receipt is emailed as soon as the payment is confirmed. This proforma is not a tax invoice.`,
       "warn",
     )}`,
  );
  const text = `Hi ${opts.name},
${opts.message?.trim() ? `\n${opts.message.trim()}\n` : ""}
Thank you for registering for ${EMAIL_BRAND}. This is your proforma invoice. Pay the registration fee to confirm your place.

${rows.map((r) => `${r.label}: ${r.value}`).join("\n")}
(fees are exclusive of GST; ${opts.fee.gstPercent}% GST is added to the subtotal)

Pay the registration fee: ${opts.payUrl}

Before you pay:
- Choose your mode of payment on the IIT Bombay OnlinePay screen, and keep the tab open until you are returned to the conference site.
- If money is debited but the payment is not confirmed, do not pay again: write to ${SUPPORT} quoting your registration ID.
- A receipt is emailed as soon as the payment is confirmed. This proforma is not a tax invoice.

${textFooter()}`;
  return { subject, html, text };
}

export function paymentReceiptEmail(opts: {
  name: string;
  payerId: string;
  amountLabel: string;
  /** Fee and GST breakdown; omitted when the amount paid does not match it. */
  fee?: FeeLines;
  transId: string;
  bankRef: string;
  paidOn: string;
  payUrl: string;
}): Email {
  const subject = `Payment received · ${EMAIL_BRAND}`;
  const rows = [
    { label: "Received from", value: opts.name },
    { label: "Registration ID", value: opts.payerId },
    ...(opts.fee ? feeRows(opts.fee) : [{ label: "Amount paid", value: opts.amountLabel, strong: true }]),
    { label: "Transaction ID", value: opts.transId },
    { label: "Bank reference", value: blank(opts.bankRef) },
    { label: "Paid on", value: blank(opts.paidOn) },
  ];
  const html = layout(
    `We received ${opts.amountLabel}. Your place is confirmed.`,
    `${label("Paid", "good")}
     ${heading("Payment received")}
     ${para(`Hi ${escapeHtml(opts.name)},`)}
     ${para(`We have received your registration fee for ${escapeHtml(EMAIL_BRAND)} through IIT Bombay OnlinePay. Keep this email as your payment receipt.`)}
     ${details(rows)}
     ${para(receiptNote(opts.fee), `margin-top:-12px;font-size:12.5px;color:${C.mute};`)}
     ${button(`${siteOrigin()}/dashboard`, "View your ticket", false)}
     ${para(`Your payment details are also on your ${link(opts.payUrl, "payment page")}.`, "font-size:14px;")}`,
  );
  const text = `Hi ${opts.name},

We have received your registration fee for ${EMAIL_BRAND} through IIT Bombay OnlinePay. Keep this email as your payment receipt.

${rows.map((r) => `${r.label}: ${r.value}`).join("\n")}
(${receiptNote(opts.fee)})

Your ticket: ${siteOrigin()}/dashboard
Payment page: ${opts.payUrl}

${textFooter()}`;
  return { subject, html, text };
}

function receiptNote(fee?: FeeLines): string {
  return fee
    ? `The total includes ${fee.gstPercent}% GST on the subtotal. This is a payment receipt, not a tax invoice.`
    : "This is a payment receipt, not a tax invoice.";
}

export type PaymentReceiptDetails = {
  payerId: string;
  amountLabel: string;
  /** Fee and GST breakdown; omitted when the amount paid does not match it. */
  fee?: FeeLines;
  transId: string;
  bankRef: string;
  paidOn: string;
  payUrl: string;
};

/**
 * The ticket email. When an online payment issued the ticket, `payment` adds
 * the receipt, so the payer gets one email with both (a separate receipt was
 * being held back by some institutional mail filters).
 */
export function registrationConfirmedEmail(opts: {
  name: string;
  editionName: string;
  ticketCode: string;
  eventDate: string;
  payment?: PaymentReceiptDetails;
}): Email {
  const subject = `You're registered · ${EMAIL_BRAND}`;
  const pay = opts.payment;
  const ticketRows = [
    { label: "Ticket code", value: opts.ticketCode, strong: true },
    { label: "Dates", value: EVENT_DATES },
    { label: "Venue", value: VENUE },
  ];
  const paymentRows = pay
    ? [
        { label: "Received from", value: opts.name },
        { label: "Registration ID", value: pay.payerId },
        ...(pay.fee ? feeRows(pay.fee) : [{ label: "Amount paid", value: pay.amountLabel, strong: true }]),
        { label: "Transaction ID", value: pay.transId },
        { label: "Bank reference", value: blank(pay.bankRef) },
        { label: "Paid on", value: blank(pay.paidOn) },
      ]
    : [];
  const html = layout(
    pay
      ? `Your ticket code is ${opts.ticketCode}. We received ${pay.amountLabel}.`
      : `Your ticket code is ${opts.ticketCode}.`,
    `${label("Confirmed", "good")}
     ${heading("You're registered")}
     ${para(`Hi ${escapeHtml(opts.name)},`)}
     ${para(`Your place at ${escapeHtml(EMAIL_BRAND)} is confirmed. Show the QR code on your dashboard at the entrance.`)}
     ${details(ticketRows)}
     ${
       pay
         ? `${subheading("Payment receipt")}
     ${para("We received your registration fee through IIT Bombay OnlinePay. Keep this email as your payment receipt.", "font-size:14px;")}
     ${details(paymentRows)}
     ${para(receiptNote(pay.fee), `margin-top:-12px;font-size:12.5px;color:${C.mute};`)}`
         : ""
     }
     ${button(`${siteOrigin()}/dashboard`, "View your ticket", false)}
     ${pay ? para(`Your payment details are also on your ${link(pay.payUrl, "payment page")}.`, "font-size:14px;") : ""}
     ${para("We will write with the final programme and travel details closer to the conference.", "font-size:14px;")}`,
  );
  const text = `Hi ${opts.name},

Your place at ${EMAIL_BRAND} is confirmed. Show the QR code on your dashboard at the entrance.

${ticketRows.map((r) => `${r.label}: ${r.value}`).join("\n")}
${
  pay
    ? `
PAYMENT RECEIPT
We received your registration fee through IIT Bombay OnlinePay. Keep this email as your payment receipt.

${paymentRows.map((r) => `${r.label}: ${r.value}`).join("\n")}
(${receiptNote(pay.fee)})
`
    : ""
}
Your ticket: ${siteOrigin()}/dashboard${pay ? `\nPayment page: ${pay.payUrl}` : ""}

${textFooter()}`;
  return { subject, html, text };
}
