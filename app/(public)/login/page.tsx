import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, oauthProvidersEnabled, signIn } from "@/auth";
import { attendeeHome } from "@/lib/auth/attendee";
import { IconGoogle } from "@/components/icons";
import { InventMark } from "@/components/site/InventMark";
import { SiteTheme } from "@/components/site/SiteTheme";
import { pageMetadata } from "@/lib/seo";
import "@/app/site.css";

export const metadata = pageMetadata({
  title: "Log in",
  description: "Log in to IITB INV.ENT (iitbinvent.com) for the conference at IIT Bombay.",
  path: "/login",
});

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
    redirect(callbackUrl);
  }

  async function loginAction(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") ?? "");
    const requested = safeCallback(String(formData.get("callbackUrl") ?? "/dashboard"));
    const next = requested.startsWith("/admin") ? requested : attendeeHome(requested);

    try {
      await signIn("credentials", { email, password, redirectTo: next });
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
    await signIn("google", { redirectTo: callbackUrl });
  }

  async function linkedInAction() {
    "use server";
    await signIn("linkedin", { redirectTo: callbackUrl });
  }

  return (
    <div className="site">
      <SiteTheme />
      <main className="site-auth">
        <div className="site-auth-card">
          <Link href="/" className="site-auth-mark" aria-label="IITB INV.ENT home">
            <InventMark style={{ fontSize: 34 }} />
          </Link>
          <p className="site-kicker is-blue">IITB INV.ENT · Sign in</p>
          <h1>Login</h1>
          <p className="lead" style={{ marginTop: 18 }}>
            Sign in to submit a paper or poster abstract, register as an attendee, and
            manage your profile. An account is not a ticket to the event.
          </p>

          {params.error ? (
            <p className="site-alert is-error" style={{ marginTop: 24 }} role="alert">
              Invalid email or password. Try again.
            </p>
          ) : null}

          {oauth.google || oauth.linkedin ? (
            <>
              <div className="site-auth-oauth">
                {oauth.google ? (
                  <form action={googleAction}>
                    <button type="submit">
                      <IconGoogle className="h-5 w-5 shrink-0" />
                      Continue with Google
                    </button>
                  </form>
                ) : null}
                {oauth.linkedin ? (
                  <form action={linkedInAction}>
                    <button type="submit" className="is-linkedin">
                      Continue with LinkedIn
                    </button>
                  </form>
                ) : null}
              </div>
              <p className="site-auth-or">or email</p>
            </>
          ) : null}

          <form action={loginAction} className="site-auth-form">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <label className="site-field">
              <span className="label">Email</span>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="site-input"
                placeholder="you@example.com"
                data-testid="login-email"
              />
            </label>
            <label className="site-field">
              <span className="label">Password</span>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className="site-input"
                data-testid="login-password"
              />
            </label>
            <div className="site-form-foot">
              <button
                type="submit"
                className="site-btn"
                style={{ width: "100%" }}
                data-testid="login-submit"
              >
                Sign in
              </button>
            </div>
          </form>

          {!oauth.google && !oauth.linkedin ? (
            <p className="site-auth-foot" style={{ fontSize: 12 }}>
              Google / LinkedIn buttons appear once OAuth client IDs are set in env (
              <code>AUTH_GOOGLE_*</code>, <code>AUTH_LINKEDIN_*</code>).
            </p>
          ) : null}

          <p className="site-auth-foot">
            No account yet?{" "}
            <Link href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
              Sign up
            </Link>
            {" · "}
            <Link href="/">← Back to IITB INV.ENT</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
