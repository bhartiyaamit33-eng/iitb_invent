import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { Role } from "@prisma/client";
import { auth, oauthProvidersEnabled, signIn } from "@/auth";
import { attendeeHome } from "@/lib/auth/attendee";
import { prisma } from "@/lib/db";
import { SUBMIT_HREF } from "@/lib/landing";
import { withBasePath } from "@/lib/base-path";
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
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return SUBMIT_HREF;
  return raw;
}

/** Reviewers land on assigned submissions unless they asked for another page. */
function postLoginPath(role: Role | undefined, requested: string): string {
  const reviewerHome =
    !requested ||
    requested === "/" ||
    requested === "/login" ||
    requested === "/signup" ||
    requested === "/dashboard" ||
    requested === "/research" ||
    requested === SUBMIT_HREF;
  if (role === Role.REVIEWER && reviewerHome) return "/dashboard/reviews";
  if (requested.startsWith("/admin")) return requested;
  return attendeeHome(requested);
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
    redirect(postLoginPath(session.user.role, callbackUrl));
  }

  async function loginAction(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") ?? "");
    const requested = safeCallback(String(formData.get("callbackUrl") ?? SUBMIT_HREF));
    const account = email
      ? await prisma.user.findUnique({
          where: { email },
          select: { role: true, deletedAt: true },
        })
      : null;
    const next = postLoginPath(
      account && !account.deletedAt ? account.role : undefined,
      requested,
    );

    try {
      await signIn("credentials", { email, password, redirectTo: withBasePath(next) });
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
    await signIn("google", { redirectTo: withBasePath(callbackUrl) });
  }

  async function linkedInAction() {
    "use server";
    await signIn("linkedin", { redirectTo: withBasePath(callbackUrl) });
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
            Sign in to register as a general attendee and pay, or to manage a submission
            already with the committee. An account is not a ticket to the event.
          </p>
          <p style={{ marginTop: 12, fontSize: 14.5, color: "var(--mute)", maxWidth: "46ch" }}>
            Programme-committee reviewers sign in with the email and password sent to
            them. That opens the submissions assigned for evaluation.
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
