import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { signOut } from "@/auth";
import {
  CONFERENCE_TOKEN_COOKIE,
  conferenceCookieClearOptions,
} from "@/lib/conference-access";
import { expireConferenceGuestCookie } from "@/lib/auth/session-end";
import { siteOrigin } from "@/lib/ticket";

export const dynamic = "force-dynamic";

/**
 * Full-document POST so logout is not a client-side RSC navigation.
 * That drops Next's router cache and the guest conference cookie together.
 */
export async function POST() {
  await expireConferenceGuestCookie();
  revalidatePath("/", "layout");
  revalidatePath("/research");
  revalidatePath("/conference/thanks");
  await signOut({ redirect: false });

  const res = NextResponse.redirect(`${siteOrigin()}/`, 303);
  const clear = conferenceCookieClearOptions();
  res.cookies.set(CONFERENCE_TOKEN_COOKIE, "", clear);
  for (const name of [
    "authjs.session-token",
    "__Secure-authjs.session-token",
  ]) {
    res.cookies.set(name, "", {
      ...clear,
      httpOnly: true,
    });
  }
  res.headers.set(
    "Cache-Control",
    "private, no-store, no-cache, max-age=0, must-revalidate",
  );
  return res;
}
