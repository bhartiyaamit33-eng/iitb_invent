"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { cancelRsvp, rsvpToSession } from "@/lib/rsvp";

export async function rsvpAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sign in required");
  const sessionId = String(formData.get("sessionId") ?? "");
  await rsvpToSession({ userId: user.id, sessionId });
  revalidatePath("/programme");
  revalidatePath("/dashboard");
}

export async function cancelRsvpAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sign in required");
  const sessionId = String(formData.get("sessionId") ?? "");
  await cancelRsvp({ userId: user.id, sessionId });
  revalidatePath("/programme");
  revalidatePath("/dashboard");
}
