/**
 * Content-Disposition values must be Latin-1. Node throws
 * "Invalid character in header content" for a filename with an accent,
 * an em dash, or any other non-ASCII character, and the upload then fails.
 */
export function contentDisposition(fileName: string, download = true): string {
  const ascii = fileName
    .replace(/[/\\]/g, " ")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/["\\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 150);
  const stem = ascii.replace(/\.pdf$/i, "").trim();
  const name = /[A-Za-z0-9]/.test(stem) ? (ascii.toLowerCase().endsWith(".pdf") ? ascii : `${stem}.pdf`) : "abstract.pdf";
  return `${download ? "attachment" : "inline"}; filename="${name}"`;
}
