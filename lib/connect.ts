type Tokens = {
  firstName: string;
  senderName: string;
  senderHeadline: string;
  eventName: string;
  eventDateShort: string;
  sessionName: string;
};

export function fillConnectNote(template: string, tokens: Tokens): string {
  return template
    .replaceAll("{firstName}", tokens.firstName)
    .replaceAll("{senderName}", tokens.senderName)
    .replaceAll("{senderHeadline}", tokens.senderHeadline)
    .replaceAll("{eventName}", tokens.eventName)
    .replaceAll("{eventDateShort}", tokens.eventDateShort)
    .replaceAll("{sessionName}", tokens.sessionName);
}

export function linkedInProfileUrl(url: string): string {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("linkedin.com")) return url;
    return u.toString();
  } catch {
    return url;
  }
}

/** Opens LinkedIn profile; note is copied to clipboard separately in the UI. */
export function firstNameFromFullName(name: string): string {
  const part = name.trim().split(/\s+/)[0];
  return part || name;
}
