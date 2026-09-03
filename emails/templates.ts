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
