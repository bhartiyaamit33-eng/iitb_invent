import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { Payment, Submission, User, Edition } from "@prisma/client";
import {
  CATEGORY_LABEL,
  KIND_LABEL,
  formatInr,
} from "@/lib/payments/pricing";

export type InvoicePayment = Payment & {
  user: Pick<User, "id" | "name" | "email">;
  submission: Pick<Submission, "title" | "kind" | "organisation" | "authors">;
  edition: Pick<Edition, "name" | "year">;
};

const TEAL = rgb(0.02, 0.373, 0.431);
const INK = rgb(0.024, 0.149, 0.184);
const MUTE = rgb(0.3, 0.42, 0.455);
const LINE = rgb(0.82, 0.88, 0.89);

/** Helvetica/WinAnsi cannot draw ₹ and most non-Latin glyphs. */
function pdfSafe(text: string, font: PDFFont, size = 9): string {
  const src = String(text ?? "").replace(/₹/g, "Rs.");
  let out = "";
  for (const ch of src) {
    try {
      font.widthOfTextAtSize(ch, size);
      out += ch;
    } catch {
      out += "?";
    }
  }
  return out;
}

function wrap(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const words = pdfSafe(text, font, size).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

async function embedLogo(
  pdf: PDFDocument,
  filename: string,
): Promise<{ width: number; height: number; draw: (page: PDFPage, x: number, y: number, h: number) => void } | null> {
  try {
    const bytes = await readFile(
      path.join(process.cwd(), "public", "assets", filename),
    );
    const lower = filename.toLowerCase();
    const img = lower.endsWith(".png")
      ? await pdf.embedPng(bytes)
      : await pdf.embedJpg(bytes);
    return {
      width: img.width,
      height: img.height,
      draw(page, x, y, h) {
        const scale = h / img.height;
        page.drawImage(img, {
          x,
          y,
          width: img.width * scale,
          height: h,
        });
      },
    };
  } catch {
    return null;
  }
}

/**
 * A4 receipt for money collected via IIT Bombay Online Pay.
 */
export async function buildInvoicePdf(payment: InvoicePayment): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const iitb = await embedLogo(pdf, "iitb-logo.png");
  const dsse = await embedLogo(pdf, "dsse-logo.png");

  let y = 790;
  if (iitb) {
    iitb.draw(page, 48, y - 8, 42);
  }
  if (dsse) {
    dsse.draw(page, 495, y - 8, 42);
  }

  y -= 58;
  page.drawText("INDIAN INSTITUTE OF TECHNOLOGY BOMBAY", {
    x: 48,
    y,
    size: 11,
    font: bold,
    color: TEAL,
  });
  y -= 16;
  page.drawText("Desai Sethi School of Entrepreneurship (DSSE)", {
    x: 48,
    y,
    size: 10,
    font,
    color: INK,
  });
  y -= 14;
  page.drawText("DSSE Building · IIT Bombay · Powai, Mumbai 400076", {
    x: 48,
    y,
    size: 8,
    font,
    color: MUTE,
  });

  y -= 18;
  page.drawLine({
    start: { x: 48, y },
    end: { x: 547, y },
    thickness: 1.5,
    color: TEAL,
  });

  y -= 28;
  page.drawText("PAYMENT RECEIPT / INVOICE", {
    x: 48,
    y,
    size: 16,
    font: bold,
    color: INK,
  });
  y -= 16;
  page.drawText(pdfSafe(payment.edition.name, font, 10), {
    x: 48,
    y,
    size: 10,
    font,
    color: MUTE,
  });

  const invoiceNo = payment.invoiceNumber ?? "PENDING";
  page.drawText(pdfSafe(`Invoice ${invoiceNo}`, bold, 11), {
    x: 360,
    y: y + 16,
    size: 11,
    font: bold,
    color: TEAL,
  });
  const issued = pdfSafe(
    (payment.invoiceSentAt ?? payment.immediateAt ?? payment.createdAt)
      .toLocaleString("en-GB", { timeZone: "Asia/Kolkata" }),
    font,
    8,
  );
  page.drawText(issued, {
    x: 360,
    y,
    size: 8,
    font,
    color: MUTE,
  });

  y -= 28;
  page.drawText("Billed to", {
    x: 48,
    y,
    size: 8,
    font: bold,
    color: MUTE,
  });
  y -= 14;
  page.drawText(pdfSafe(payment.user.name, bold, 12), {
    x: 48,
    y,
    size: 12,
    font: bold,
    color: INK,
  });
  y -= 14;
  page.drawText(pdfSafe(payment.user.email, font, 9), {
    x: 48,
    y,
    size: 9,
    font,
    color: INK,
  });

  const org = payment.submission.organisation;
  if (org) {
    y -= 12;
    page.drawText(pdfSafe(org, font, 9), { x: 48, y, size: 9, font, color: MUTE });
  }

  y -= 28;
  const rows: [string, string][] = [
    ["Purpose", payment.purpose],
    [
      "Contribution",
      `${KIND_LABEL[payment.submission.kind]} — ${payment.submission.title}`,
    ],
    ["Payer category", CATEGORY_LABEL[payment.payerCategory]],
    ["Amount received", `${formatInr(payment.amount.toString())} ${payment.currency}`],
    ["Online Pay app id", payment.appId || "—"],
    ["User id (INVENT)", payment.user.id],
    ["User id (Online Pay)", payment.opUserId],
    ["Request id (sReqId)", payment.reqId],
    ["IITB transaction id", payment.transId ?? "—"],
    ["Bank reference (refNo)", payment.refNo ?? "—"],
    ["Payment mode (provId)", payment.provId ?? "—"],
    ["Gateway status", payment.pgStatus ?? "—"],
    ["Gateway message", payment.msg ?? "—"],
    [
      "Transaction date / time",
      [payment.transDate, payment.transTime].filter(Boolean).join(" ") || "—",
    ],
    [
      "Reconciliation",
      [payment.reconDate, payment.reconTime].filter(Boolean).join(" ") ||
        (payment.settledAt
          ? payment.settledAt.toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            })
          : "Pending Cash Section settlement"),
    ],
    ["Payment status", payment.status],
  ];

  if (payment.submission.authors) {
    rows.splice(2, 0, ["Authors", payment.submission.authors]);
  }

  for (const [label, value] of rows) {
    if (y < 90) break;
    page.drawLine({
      start: { x: 48, y: y + 12 },
      end: { x: 547, y: y + 12 },
      thickness: 0.4,
      color: LINE,
    });
    page.drawText(label, {
      x: 48,
      y,
      size: 8,
      font: bold,
      color: MUTE,
    });
    const lines = wrap(value || "—", font, 9, 330);
    let lineY = y;
    for (const line of lines) {
      page.drawText(line, {
        x: 210,
        y: lineY,
        size: 9,
        font,
        color: INK,
      });
      lineY -= 12;
    }
    y = lineY - 6;
  }

  y -= 10;
  page.drawLine({
    start: { x: 48, y: y + 16 },
    end: { x: 547, y: y + 16 },
    thickness: 1,
    color: TEAL,
  });

  const footer = [
    "Collected through IIT Bombay Online Pay into an IIT Bombay account.",
    "PayU / net-banking is a payment mode on Online Pay; INVENT does not hold a separate merchant account.",
    "This is a computer-generated receipt. GST/surcharge, if any, is as configured for this application with Online Pay.",
    "Queries: conference@iitbinvent.com",
  ];
  y = 58;
  for (const line of footer) {
    page.drawText(line, { x: 48, y, size: 7, font, color: MUTE });
    y -= 10;
  }

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}

export function invoiceFilename(payment: Pick<Payment, "invoiceNumber" | "reqId">): string {
  const slug = (payment.invoiceNumber ?? payment.reqId).replace(/[^\w.-]+/g, "_");
  return `INVENT-invoice-${slug}.pdf`;
}
