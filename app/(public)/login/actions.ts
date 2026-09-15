"use server";

import { endBrowserSession } from "@/lib/auth/session-end";

export async function logoutAction() {
  await endBrowserSession("/");
}
