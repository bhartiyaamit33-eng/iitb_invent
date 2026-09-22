import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { auth, oauthProvidersEnabled, signIn } from "@/auth";
import { prisma } from "@/lib/db";
import { isAdminEmail } from "@/lib/auth/roles";
import { attendeeHome } from "@/lib/auth/attendee";
import { sendSignupThankYouForUser } from "@/lib/email/transactions";
import { IconGoogle } from "@/components/icons";
import { InventMark } from "@/components/site/InventMark";
import { SiteTheme } from "@/components/site/SiteTheme";
import { pageMetadata } from "@/lib/seo";
import "@/app/site.css";

export const metadata = pageMetadata({
  title: "Create an account",
  description:
    "Create a free IITB INV.ENT account, then submit a paper or poster abstract. An account is not an event ticket.",
  path: "/signup",
});

type SearchParams = Promise<{ callbackUrl?: string; error?: string }>;

function safeCallback(raw: string | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const callbackUrl = safeCallback(params.callbackUrl);
  const session = await auth();
  const oauth = oauthProvidersEnabled();
  if (session?.user) {
    redirect(
      isAdminEmail(session.user.email) ? "/admin" : attendeeHome(callbackUrl),
    );
  }

  async function googleAction() {
    "use server";
    await signIn("google", { redirectTo: attendeeHome(callbackUrl) });
  }

  async function signupAction(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") ?? "");
    const requested = safeCallback(String(formData.get("callbackUrl") ?? "/dashboard"));

    if (!name || !email || password.length < 8) {
      redirect(
        `/signup?error=invalid&callbackUrl=${encodeURIComponent(requested)}`,
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      redirect(
        `/signup?error=exists&callbackUrl=${encodeURIComponent(requested)}`,
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const role = isAdminEmail(email) ? Role.ADMIN : Role.ATTENDEE;

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role,
        emailVerified: new Date(),
        profile: {
          create: {
            completeness: 0,
            directoryOptIn: false,
          },
        },
      },
    });

    void sendSignupThankYouForUser(user.id).catch(() => undefined);

    const next = isAdminEmail(email)
      ? "/dashboard"
      : requested === "/"
        ? "/dashboard?welcome=1"
        : requested.includes("welcome")
          ? requested
          : requested === "/dashboard"
            ? "/dashboard?welcome=1"
            : requested;

    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: next,
      });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect(`/login?callbackUrl=${encodeURIComponent(next)}`);
      }
      throw err;
    }
  }

  return (
    <div className="site">
      <SiteTheme />
      <main className="site-auth">
        <div className="site-auth-card">
          <Link href="/" className="site-auth-mark" aria-label="IITB INV.ENT home">
            <InventMark style={{ fontSize: 34 }} />
          </Link>
          <p className="site-kicker is-blue">IITB INV.ENT · Create account</p>
          <h1>Sign up</h1>
          <p className="lead" style={{ marginTop: 18 }}>
            Name and email only. Profile details come after, never a gate.
          </p>

          {params.error === "exists" ? (
            <p className="site-alert is-error" style={{ marginTop: 24 }} role="alert">
              That email is already registered. <Link href="/login">Sign in</Link>.
            </p>
          ) : null}
          {params.error === "invalid" ? (
            <p className="site-alert is-error" style={{ marginTop: 24 }} role="alert">
              Use a name, valid email, and password of at least 8 characters.
            </p>
          ) : null}

          {oauth.google ? (
            <>
              <div className="site-auth-oauth">
                <form action={googleAction}>
                  <button type="submit">
                    <IconGoogle className="h-5 w-5 shrink-0" />
                    Continue with Google
                  </button>
                </form>
              </div>
              <p className="site-auth-or">or email</p>
            </>
          ) : null}

          <form action={signupAction} className="site-auth-form">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <label className="site-field">
              <span className="label">Name</span>
              <input
                name="name"
                required
                autoComplete="name"
                className="site-input"
                data-testid="signup-name"
              />
            </label>
            <label className="site-field">
              <span className="label">Email</span>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="site-input"
                data-testid="signup-email"
              />
            </label>
            <label className="site-field">
              <span className="label">Password</span>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="site-input"
                data-testid="signup-password"
              />
              <span className="hint">At least 8 characters.</span>
            </label>
            <div className="site-form-foot">
              <button
                type="submit"
                className="site-btn"
                style={{ width: "100%" }}
                data-testid="signup-submit"
              >
                Create account
              </button>
            </div>
          </form>

          <p className="site-auth-foot">
            Already have an account? <Link href="/login">Sign in</Link>
            {" · "}
            <Link href="/">← Back to IITB INV.ENT</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
