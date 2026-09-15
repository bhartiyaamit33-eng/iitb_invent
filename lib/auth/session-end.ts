import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { signOut } from "@/auth";
import {
  CONFERENCE_TOKEN_COOKIE,
  conferenceCookieClearOptions,
} from "@/lib/conference-access";

export async function expireConferenceGuestCookie() {
  const store = await cookies();
  store.set(CONFERENCE_TOKEN_COOKIE, "", conferenceCookieClearOptions());
}

/** Drop the Auth.js session, the guest CFP cookie, and cached public pages. */
export async function endBrowserSession(redirectTo = "/") {
  await expireConferenceGuestCookie();
  revalidatePath("/", "layout");
  revalidatePath("/conference");
  revalidatePath("/conference/thanks");
  await signOut({ redirectTo });
}
