import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, oauthProvidersEnabled, signIn } from "@/auth";
import { attendeeHome } from "@/lib/auth/attendee";
import { isAdminEmail } from "@/lib/auth/roles";
import { IconGoogle } from "@/components/icons";

type SearchParams = Promise<{ callbackUrl?: string; error?: string }>;

function safeCallback(raw: string | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const callbackUrl = safeCallback(params.callbackUrl);
  const session = await auth();
  const oauth = oauthProvidersEnabled();

  if (session?.user) {
    // Login is for attendees. Admin CMS only via explicit /admin callback.
    if (callbackUrl.startsWith("/admin") && isAdminEmail(session.user.email)) {
      redirect(callbackUrl);
    }
    redirect(attendeeHome(callbackUrl));
  }

  async function loginAction(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") ?? "");
    const requested = safeCallback(String(formData.get("callbackUrl") ?? "/dashboard"));
    // Attendee home by default — admin console only if they asked for /admin
    const next =
      requested.startsWith("/admin") && isAdminEmail(email)
        ? requested
        : attendeeHome(requested);

    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: next,
      });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect(
          `/login?error=CredentialsSignin&callbackUrl=${encodeURIComponent(requested)}`,
        );
      }
      throw err;
    }
  }

  async function googleAction() {
    "use server";
    await signIn("google", { redirectTo: attendeeHome(callbackUrl) });
  }

  async function linkedInAction() {
    "use server";
    await signIn("linkedin", { redirectTo: attendeeHome(callbackUrl) });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        Inv.ent · Attendee sign in
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-wide text-teal-deep">
        Login
      </h1>
      <p className="mt-3 text-ink-soft">
        Sign in to RSVP, complete your profile, and join the attendee directory.
      </p>

      {params.error ? (
        <p
          className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          Invalid email or password. Try again.
        </p>
      ) : null}

      <div className="mt-8 space-y-3">
        {oauth.google ? (
          <form action={googleAction}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2.5 rounded-md border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-sm hover:border-teal"
            >
              <IconGoogle className="h-5 w-5 shrink-0" />
              Continue with Google
            </button>
          </form>
        ) : null}
        {oauth.linkedin ? (
          <form action={linkedInAction}>
            <button
              type="submit"
              className="w-full rounded-md border border-line bg-[#0A66C2] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95"
            >
              Continue with LinkedIn
            </button>
          </form>
        ) : null}
        {(oauth.google || oauth.linkedin) && (
          <p className="text-center text-xs uppercase tracking-[0.14em] text-mute">
            or email
          </p>
        )}
      </div>

      <form action={loginAction} className="mt-4 space-y-5">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <label className="block">
          <span className="text-sm font-medium text-ink">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="mt-1.5 w-full rounded-md border border-line bg-white px-3 py-2.5 text-ink outline-none focus:border-teal"
            placeholder="you@example.com"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Password</span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="mt-1.5 w-full rounded-md border border-line bg-white px-3 py-2.5 text-ink outline-none focus:border-teal"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-md bg-teal-deep px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-teal"
        >
          Sign in
        </button>
      </form>

      {!oauth.google && !oauth.linkedin ? (
        <p className="mt-4 text-xs text-mute">
          Google / LinkedIn buttons appear once OAuth client IDs are set in env (
          <code>AUTH_GOOGLE_*</code>, <code>AUTH_LINKEDIN_*</code>).
        </p>
      ) : null}

      <p className="mt-8 text-sm text-mute">
        No account yet?{" "}
        <Link
          href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-semibold text-teal-deep underline-offset-2 hover:underline"
        >
          Sign up
        </Link>
        {" · "}
        <Link href="/" className="text-teal-deep underline-offset-2 hover:underline">
          ← Back to Inv.ent
        </Link>
      </p>
    </main>
  );
}
