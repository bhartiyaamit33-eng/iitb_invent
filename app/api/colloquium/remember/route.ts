import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  COLLOQUIUM_TOKEN_COOKIE,
  colloquiumCookieOptions,
} from "@/lib/colloquium-access";

export const dynamic = "force-dynamic";

/** Remember this payment token on the browser so /colloquium skips the blank form. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { token?: string } | null;
  const token = String(body?.token ?? "").trim();
  if (!token || token.length < 16) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  const application = await prisma.colloquiumApplication.findUnique({
    where: { paymentToken: token },
    select: { paymentToken: true },
  });
  if (!application) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    COLLOQUIUM_TOKEN_COOKIE,
    application.paymentToken,
    colloquiumCookieOptions(),
  );
  return res;
}
