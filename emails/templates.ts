function layout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#0b1f24;font-family:Georgia,'Times New Roman',serif;color:#e8f2f4;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b1f24;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#102a30;border:1px solid #1e4a52;border-radius:4px;padding:28px 32px;">
        <tr><td style="font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#7ec8c8;">INVENT · IIT Bombay DSSE</td></tr>
        <tr><td style="padding-top:16px;font-size:24px;color:#f4fbfb;">${escapeHtml(title)}</td></tr>
        <tr><td style="padding-top:16px;font-size:16px;line-height:1.55;color:#c5d9dd;">${bodyHtml}</td></tr>
        <tr><td style="padding-top:28px;font-size:12px;color:#6a8a90;">Venue: DSSE Building · IIT Bombay · Powai<br/>Sent by conference@iitbinvent.com · Do not reply to this automated message.</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function registrationConfirmedEmail(opts: {
  name: string;
  editionName: string;
  ticketCode: string;
  eventDate: string;
}): { subject: string; html: string; text: string } {
  const subject = `Registration confirmed — ${opts.editionName}`;
  const html = layout(
    "You're registered",
    `<p>Hi ${escapeHtml(opts.name)},</p>
     <p>Your registration for <strong>${escapeHtml(opts.editionName)}</strong> (${escapeHtml(opts.eventDate)}) is confirmed.</p>
     <p>Ticket code: <strong style="letter-spacing:0.08em;">${escapeHtml(opts.ticketCode)}</strong></p>
     <p>We will email updates from conference@iitbinvent.com as the programme firms up.</p>`,
  );
  const text = `Hi ${opts.name},\n\nYour registration for ${opts.editionName} (${opts.eventDate}) is confirmed.\nTicket code: ${opts.ticketCode}\n\n— INVENT · DSSE Building, IIT Bombay`;
  return { subject, html, text };
}

export function profileConfirmationEmail(opts: {
  name: string;
  isFirstSave: boolean;
}): { subject: string; html: string; text: string } {
  const subject = opts.isFirstSave
    ? "Your INVENT profile is ready"
    : "Your INVENT profile was updated";
  const html = layout(
    opts.isFirstSave ? "Profile created" : "Profile updated",
    `<p>Hi ${escapeHtml(opts.name)},</p>
     <p>${
       opts.isFirstSave
         ? "Thanks for creating your INVENT profile. You can update it any time from your dashboard."
         : "We saved the changes to your INVENT profile."
     }</p>`,
  );
  const text = `Hi ${opts.name},\n\n${
    opts.isFirstSave
      ? "Your INVENT profile is ready."
      : "Your INVENT profile was updated."
  }\n\n— INVENT · conference@iitbinvent.com`;
  return { subject, html, text };
}

export function accountCreatedEmail(opts: {
  name: string;
  editionName?: string | null;
  dashboardUrl: string;
  ticketCode?: string | null;
  eventDate?: string | null;
}): { subject: string; html: string; text: string } {
  const subject = "Your INVENT account is ready";
  const ticketBlock = opts.ticketCode
    ? `<p>You're registered for <strong>${escapeHtml(opts.editionName ?? "INVENT")}</strong>${
        opts.eventDate ? ` (${escapeHtml(opts.eventDate)})` : ""
      }.<br/>Ticket code: <strong style="letter-spacing:0.08em;">${escapeHtml(opts.ticketCode)}</strong></p>`
    : opts.editionName
      ? `<p>You're set up for <strong>${escapeHtml(opts.editionName)}</strong>.</p>`
      : "";
  const html = layout(
    "Welcome to INVENT",
    `<p>Hi ${escapeHtml(opts.name)},</p>
     <p>Your account on <strong>iitbinvent.com</strong> has been created. This message is from <strong>conference@iitbinvent.com</strong>.</p>
     ${ticketBlock}
     <p>Next step: complete your profile (LinkedIn, role, photo) so other attendees can find you.</p>
     <p style="padding:16px 0;"><a href="${escapeHtml(opts.dashboardUrl)}" style="background:#1a6b6b;color:#fff;padding:12px 18px;text-decoration:none;border-radius:3px;">Open your dashboard</a></p>
     <p>Sign in with the email and password you just chose anytime.</p>`,
  );
  const text = `Hi ${opts.name},

Your INVENT account on iitbinvent.com has been created (from conference@iitbinvent.com).

${opts.ticketCode ? `Registered for ${opts.editionName ?? "INVENT"}${opts.eventDate ? ` (${opts.eventDate})` : ""}.\nTicket code: ${opts.ticketCode}\n\n` : ""}${opts.editionName && !opts.ticketCode ? `You're set up for ${opts.editionName}.\n\n` : ""}Complete your profile so others can find you.

Dashboard: ${opts.dashboardUrl}

— INVENT · DSSE Building, IIT Bombay`;
  return { subject, html, text };
}

export function magicLinkEmail(opts: {
  name?: string;
  url: string;
}): { subject: string; html: string; text: string } {
  const subject = "Your INVENT sign-in link";
  const greet = opts.name ? `Hi ${escapeHtml(opts.name)},` : "Hi,";
  const html = layout(
    "Sign in to INVENT",
    `<p>${greet}</p>
     <p>Use this one-time link to sign in (expires soon):</p>
     <p style="padding:16px 0;"><a href="${escapeHtml(opts.url)}" style="background:#1a6b6b;color:#fff;padding:12px 18px;text-decoration:none;border-radius:3px;">Sign in</a></p>
     <p style="font-size:13px;word-break:break-all;color:#8aaeb4;">${escapeHtml(opts.url)}</p>
     <p>If you did not request this, you can ignore this email.</p>`,
  );
  const text = `${opts.name ? `Hi ${opts.name},` : "Hi,"}\n\nSign in to INVENT:\n${opts.url}\n\nIf you did not request this, ignore this email.\n`;
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
  const subject = `${opts.fromName} wants to connect at ${opts.editionName}`;
  const contactBits = [
    `Email: ${escapeHtml(opts.fromEmail)}`,
    opts.fromPhone ? `Phone: ${escapeHtml(opts.fromPhone)}` : null,
    opts.fromLinkedIn
      ? `LinkedIn: <a href="${escapeHtml(opts.fromLinkedIn)}">${escapeHtml(opts.fromLinkedIn)}</a>`
      : null,
    opts.fromHeadline ? `About: ${escapeHtml(opts.fromHeadline)}` : null,
  ]
    .filter(Boolean)
    .join("<br/>");

  const html = layout(
    "Connection request",
    `<p>Hi ${escapeHtml(opts.toName)},</p>
     <p><strong>${escapeHtml(opts.fromName)}</strong> (attending ${escapeHtml(opts.editionName)}) asked us to introduce them. They are not CC'd on this email.</p>
     <p style="padding:12px 16px;background:#0b1f24;border-left:3px solid #7ec8c8;color:#e8f2f4;">${escapeHtml(opts.message).replace(/\n/g, "<br/>")}</p>
     <p style="padding-top:12px;">${contactBits}</p>
     <p>Reply directly to them if you'd like to connect.</p>`,
  );
  const text = `Hi ${opts.toName},

${opts.fromName} (attending ${opts.editionName}) asked us to introduce them.

Message:
${opts.message}

Contact:
Email: ${opts.fromEmail}
${opts.fromPhone ? `Phone: ${opts.fromPhone}\n` : ""}${opts.fromLinkedIn ? `LinkedIn: ${opts.fromLinkedIn}\n` : ""}${opts.fromHeadline ? `About: ${opts.fromHeadline}\n` : ""}
— INVENT · conference@iitbinvent.com`;
  return { subject, html, text };
}
