const EMAIL_BRAND = "IIT Bombay INV.ENT";
const EMAIL_DATES = "30-31 Jan 2027";

function layout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:24px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#222222;">
  <div style="max-width:600px;">
    <p style="margin:0 0 2px;font-size:14px;color:#222222;">${escapeHtml(EMAIL_BRAND)}</p>
    <p style="margin:0 0 20px;font-size:13px;color:#555555;">${escapeHtml(EMAIL_DATES)}</p>
    <p style="margin:0 0 16px;font-size:18px;font-weight:bold;color:#222222;">${escapeHtml(title)}</p>
    <div style="font-size:15px;line-height:1.6;color:#222222;">${bodyHtml}</div>
    <p style="margin:28px 0 0;padding-top:12px;border-top:1px solid #dddddd;font-size:12px;line-height:1.5;color:#555555;">
      Venue: DSSE Building, IIT Bombay, Powai<br/>
      Sent by conference@iitbinvent.com. Please do not reply to this automated message.
    </p>
  </div>
</body>
</html>`;
}

function mailLink(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}" style="color:#1155cc;">${escapeHtml(label)}</a>`;
}

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

const CONFERENCE_PHRASE =
  "an entrepreneurship research and practice conference conducted by the Desai Sethi School of Entrepreneurship, IIT Bombay";

function submissionLead(participation: string): {
  title: string;
  subject: string;
  thanks: string;
} {
  switch (participation) {
    case "PAPER_ONLY":
    case "Paper Presentation Only":
      return {
        title: "Thank you for submitting",
        subject: `Thank you for submitting your paper · ${EMAIL_BRAND}`,
        thanks: `Thank you for submitting your paper for presentation at <strong>${escapeHtml(EMAIL_BRAND)}</strong>, ${CONFERENCE_PHRASE}.`,
      };
    case "POSTER_ONLY":
    case "Poster Presentation only":
      return {
        title: "Thank you for submitting",
        subject: `Thank you for submitting your poster · ${EMAIL_BRAND}`,
        thanks: `Thank you for submitting your poster for presentation at <strong>${escapeHtml(EMAIL_BRAND)}</strong>, ${CONFERENCE_PHRASE}.`,
      };
    case "PAPER_OR_POSTER":
    case "Paper or Poster Presentations":
      return {
        title: "Thank you for submitting",
        subject: `Thank you for submitting · ${EMAIL_BRAND}`,
        thanks: `Thank you for sending in your work to present a paper or a poster at <strong>${escapeHtml(EMAIL_BRAND)}</strong>, ${CONFERENCE_PHRASE}.`,
      };
    case "ATTENDEE":
    case "Attendee":
      return {
        title: "Thank you for applying",
        subject: `Thank you for applying · ${EMAIL_BRAND}`,
        thanks: `Thank you for applying to attend <strong>${escapeHtml(EMAIL_BRAND)}</strong>, ${CONFERENCE_PHRASE}.`,
      };
    default:
      return {
        title: "Thank you for applying",
        subject: `Thank you for applying · ${EMAIL_BRAND}`,
        thanks: `Thank you for applying to <strong>${escapeHtml(EMAIL_BRAND)}</strong>, ${CONFERENCE_PHRASE}.`,
      };
  }
}

const FEE_NOTE =
  "Organisers will review this and write to this email if you are selected. The registration fee and payment link are sent only after that decision. The fee is the same whether you present a paper, a poster, or attend.";

export function registrationConfirmedEmail(opts: {
  name: string;
  editionName: string;
  ticketCode: string;
  eventDate: string;
}): { subject: string; html: string; text: string } {
  const subject = `Registration confirmed · ${EMAIL_BRAND}`;
  const html = layout(
    "You're registered",
    `<p style="margin:0 0 14px;">Hi ${escapeHtml(opts.name)},</p>
     <p style="margin:0 0 14px;">Your registration for <strong>${escapeHtml(EMAIL_BRAND)}</strong> (${escapeHtml(opts.eventDate)}) is confirmed.</p>
     <p style="margin:0 0 14px;">Ticket code: <strong style="letter-spacing:0.06em;">${escapeHtml(opts.ticketCode)}</strong></p>
     <p style="margin:0;">We will email updates from conference@iitbinvent.com as the programme firms up.</p>`,
  );
  const text = `Hi ${opts.name},

Your registration for ${EMAIL_BRAND} (${opts.eventDate}) is confirmed.
Ticket code: ${opts.ticketCode}

${EMAIL_BRAND} · DSSE Building, IIT Bombay`;
  return { subject, html, text };
}

export function profileConfirmationEmail(opts: {
  name: string;
  isFirstSave: boolean;
}): { subject: string; html: string; text: string } {
  const subject = opts.isFirstSave
    ? `Your ${EMAIL_BRAND} profile is ready`
    : `Your ${EMAIL_BRAND} profile was updated`;
  const html = layout(
    opts.isFirstSave ? "Profile created" : "Profile updated",
    `<p style="margin:0 0 14px;">Hi ${escapeHtml(opts.name)},</p>
     <p style="margin:0;">${
       opts.isFirstSave
         ? `Thanks for creating your ${escapeHtml(EMAIL_BRAND)} profile. You can update it any time from your dashboard.`
         : `We saved the changes to your ${escapeHtml(EMAIL_BRAND)} profile.`
     }</p>`,
  );
  const text = `Hi ${opts.name},

${
  opts.isFirstSave
    ? `Your ${EMAIL_BRAND} profile is ready.`
    : `Your ${EMAIL_BRAND} profile was updated.`
}

${EMAIL_BRAND} · conference@iitbinvent.com`;
  return { subject, html, text };
}

export function accountCreatedEmail(opts: {
  name: string;
  editionName?: string | null;
  dashboardUrl: string;
  applyUrl?: string;
  ticketCode?: string | null;
  eventDate?: string | null;
}): { subject: string; html: string; text: string } {
  const subject = `Your account is ready · ${EMAIL_BRAND}`;
  const applyUrl = opts.applyUrl || opts.dashboardUrl;
  const html = layout(
    "Your account is ready",
    `<p style="margin:0 0 14px;">Hi ${escapeHtml(opts.name)},</p>
     <p style="margin:0 0 14px;">Thank you. You have successfully created an account on <strong>iitbinvent.com</strong>.</p>
     <p style="margin:0 0 14px;">This is not a confirmed place at <strong>${escapeHtml(EMAIL_BRAND)}</strong> yet. Log in, then submit a paper or poster abstract. An account is not a ticket.</p>
     <p style="margin:0 0 14px;">The organising team reviews every application. If you are selected, you will receive an invitation with the registration fee and a payment link. Paying that fee confirms your place at the conference.</p>
     <p style="margin:0 0 8px;">${mailLink(applyUrl, "Apply on the conference page")}</p>
     <p style="margin:0 0 14px;">${mailLink(opts.dashboardUrl, "Open your dashboard")}</p>
     <p style="margin:0;">Sign in anytime with this email.</p>`,
  );
  const text = `Hi ${opts.name},

Thank you. You have successfully created an account on iitbinvent.com.

This is not a confirmed place at ${EMAIL_BRAND} yet. Log in, then submit a paper or poster abstract. An account is not a ticket.

The organising team reviews every application. If you are selected, you will receive an invitation with the registration fee and a payment link. Paying that fee confirms your place at the conference.

Apply: ${applyUrl}
Dashboard: ${opts.dashboardUrl}

Sign in anytime with this email.

${EMAIL_BRAND} · DSSE Building, IIT Bombay`;
  return { subject, html, text };
}

export function magicLinkEmail(opts: {
  name?: string;
  url: string;
}): { subject: string; html: string; text: string } {
  const subject = `Your ${EMAIL_BRAND} sign-in link`;
  const greet = opts.name ? `Hi ${escapeHtml(opts.name)},` : "Hi,";
  const html = layout(
    `Sign in to ${EMAIL_BRAND}`,
    `<p style="margin:0 0 14px;">${greet}</p>
     <p style="margin:0 0 14px;">Use this one-time link to sign in (expires soon):</p>
     <p style="margin:0 0 14px;">${mailLink(opts.url, "Sign in")}</p>
     <p style="margin:0 0 14px;font-size:13px;word-break:break-all;color:#555555;">${escapeHtml(opts.url)}</p>
     <p style="margin:0;">If you did not request this, you can ignore this email.</p>`,
  );
  const text = `${opts.name ? `Hi ${opts.name},` : "Hi,"}

Sign in to ${EMAIL_BRAND}:
${opts.url}

If you did not request this, ignore this email.
`;
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
}): { subject: string; html: string; text: string } {
  const subject = `${opts.fromName} wants to connect at ${EMAIL_BRAND}`;
  const contactBits = [
    `Email: ${escapeHtml(opts.fromEmail)}`,
    opts.fromPhone ? `Phone: ${escapeHtml(opts.fromPhone)}` : null,
    opts.fromLinkedIn
      ? `LinkedIn: ${mailLink(opts.fromLinkedIn, opts.fromLinkedIn)}`
      : null,
    opts.fromHeadline ? `About: ${escapeHtml(opts.fromHeadline)}` : null,
  ]
    .filter(Boolean)
    .join("<br/>");

  const html = layout(
    "Connection request",
    `<p style="margin:0 0 14px;">Hi ${escapeHtml(opts.toName)},</p>
     <p style="margin:0 0 14px;"><strong>${escapeHtml(opts.fromName)}</strong> (attending ${escapeHtml(EMAIL_BRAND)}) asked us to introduce them. They are not CC'd on this email.</p>
     <p style="margin:0 0 14px;padding:8px 0;border-top:1px solid #dddddd;border-bottom:1px solid #dddddd;">${escapeHtml(opts.message).replace(/\n/g, "<br/>")}</p>
     <p style="margin:0 0 14px;padding-top:4px;">${contactBits}</p>
     <p style="margin:0;">Reply directly to them if you'd like to connect.</p>`,
  );
  const text = `Hi ${opts.toName},

${opts.fromName} (attending ${EMAIL_BRAND}) asked us to introduce them.

Message:
${opts.message}

Contact:
Email: ${opts.fromEmail}
${opts.fromPhone ? `Phone: ${opts.fromPhone}\n` : ""}${opts.fromLinkedIn ? `LinkedIn: ${opts.fromLinkedIn}\n` : ""}${opts.fromHeadline ? `About: ${opts.fromHeadline}\n` : ""}
${EMAIL_BRAND} · conference@iitbinvent.com`;
  return { subject, html, text };
}

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
}): { subject: string; html: string; text: string } {
  const rows: [string, string][] = [
    ["Name", opts.name],
    ["Email", opts.email],
    ["Phone", opts.phone],
    ["Institution", opts.institution],
    ["Professional category", opts.professional],
    ["PhD year", blank(opts.phdYear === "-" ? "" : opts.phdYear)],
    ["Seeking post-doctoral opportunities", blank(opts.seekingPostdoc === "-" ? "" : opts.seekingPostdoc)],
    ["Participation", opts.participation],
    ["Proposed title", blank(opts.paperTitle)],
    ["Extended abstract", opts.abstractFileName || "Not uploaded"],
  ];
  const htmlRows = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#555555;width:42%;vertical-align:top;">${escapeHtml(k)}</td><td style="padding:4px 0;color:#222222;">${escapeHtml(v)}</td></tr>`,
    )
    .join("");
  const copy = submissionLead(opts.participationCategory || opts.participation);
  const html = layout(
    copy.title,
    `<p style="margin:0 0 14px;">Hi ${escapeHtml(opts.name)},</p>
     <p style="margin:0 0 14px;">${copy.thanks}</p>
     <p style="margin:0 0 14px;">${FEE_NOTE}</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;border-top:1px solid #d5e4e6;">${htmlRows}</table>
     <p style="margin:16px 0 0;">Questions: support@iitbinvent.com</p>`,
  );
  const thanksText = copy.thanks.replace(/<[^>]+>/g, "");
  const text = `Hi ${opts.name},

${thanksText}

${FEE_NOTE}

${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}

Questions: support@iitbinvent.com
${EMAIL_BRAND} · DSSE, IIT Bombay`;
  return { subject: copy.subject, html, text };
}

export function conferenceOrganiserNotifyEmail(opts: {
  name: string;
  email: string;
  institution: string;
  participation: string;
  paperTitle: string;
  eventName: string;
  adminUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `New conference application · ${opts.name}`;
  const html = layout(
    "New conference application",
    `<p style="margin:0 0 14px;"><strong>${escapeHtml(opts.name)}</strong> (${escapeHtml(opts.email)}) applied from ${escapeHtml(opts.institution)}.</p>
     <p style="margin:0 0 14px;">Participation: ${escapeHtml(opts.participation)}</p>
     <p style="margin:0 0 14px;">Title: ${escapeHtml(blank(opts.paperTitle))}</p>
     <p style="margin:16px 0 0;">${mailLink(opts.adminUrl, "Open in admin")}</p>`,
  );
  const text = `New application for ${EMAIL_BRAND}

${opts.name} <${opts.email}>
${opts.institution}
${opts.participation}
${blank(opts.paperTitle)}

${opts.adminUrl}
`;
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
}): { subject: string; html: string; text: string } {
  const subject = `Application update · ${EMAIL_BRAND}`;
  const paymentHtml = opts.includePayment
    ? `<p style="margin:0 0 14px;">Registration fee: <strong>${escapeHtml(opts.amountLabel)}</strong>.</p>
       <p style="margin:0 0 14px;">Pay through IIT Bombay Online Pay using this personal link. It opens checkout. You do not fill the application form again.</p>
       <p style="margin:0 0 14px;">${mailLink(opts.paymentUrl, `Pay ${opts.amountLabel}`)}</p>
       <p style="margin:0 0 14px;font-size:13px;color:#555555;word-break:break-all;">${escapeHtml(opts.paymentUrl)}</p>
       <p style="margin:0 0 14px;">The same pay link is on your ${mailLink(opts.dashboardUrl, "IITB INV.ENT dashboard")}.</p>`
    : "";
  const html = layout(
    opts.statusLabel,
    `<p style="margin:0 0 14px;">Hi ${escapeHtml(opts.name)},</p>
     <p style="margin:0 0 14px;">${escapeHtml(opts.message).replace(/\n/g, "<br/>")}</p>
     <p style="margin:0 0 14px;">Current status: <strong>${escapeHtml(opts.statusLabel)}</strong>.</p>
     ${paymentHtml}
     <p style="margin:0;">Questions: support@iitbinvent.com</p>`,
  );
  const paymentText = opts.includePayment
    ? `\nRegistration fee: ${opts.amountLabel}\nPay via IIT Bombay Online Pay: ${opts.paymentUrl}\nOr open your dashboard: ${opts.dashboardUrl}\n`
    : "";
  const text = `Hi ${opts.name},

${opts.message}

Current status: ${opts.statusLabel}
${paymentText}
Questions: support@iitbinvent.com
${EMAIL_BRAND} · DSSE, IIT Bombay`;
  return { subject, html, text };
}
