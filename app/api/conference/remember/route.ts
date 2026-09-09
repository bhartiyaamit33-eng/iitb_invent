import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  CONFERENCE_TOKEN_COOKIE,
  conferenceCookieOptions,
} from "@/lib/conference-access";

export const dynamic = "force-dynamic";

/** Remember this payment token on the browser so /conference skips the blank form. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { token?: string } | null;
  const token = String(body?.token ?? "").trim();
  if (!token || token.length < 16) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  const application = await prisma.conferenceApplication.findUnique({
    where: { paymentToken: token },
    select: { paymentToken: true },
  });
  if (!application) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    CONFERENCE_TOKEN_COOKIE,
    application.paymentToken,
    conferenceCookieOptions(),
  );
  return res;
}
