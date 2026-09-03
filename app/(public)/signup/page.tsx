import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { randomBytes } from "crypto";
import { auth, signIn } from "@/auth";
import { prisma } from "@/lib/db";
import { isAdminEmail } from "@/lib/auth/roles";
import { sendAccountCreated } from "@/lib/email/transactions";

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
  if (session?.user) {
    redirect(isAdminEmail(session.user.email) ? "/admin" : "/dashboard");
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

    const site =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.AUTH_URL ||
      "https://iitbinvent.com";
    const dashboardUrl = `${site.replace(/\/$/, "")}/dashboard`;

    const edition = await prisma.edition.findFirst({
      where: { isCurrent: true },
    });

    let ticketCode: string | null = null;
    if (edition) {
      const reg = await prisma.registration.create({
        data: {
          userId: user.id,
          editionId: edition.id,
          status: "CONFIRMED",
          ticketCode: `INV${String(edition.year).slice(2)}-${randomBytes(3).toString("hex").toUpperCase()}`,
          qrToken: randomBytes(24).toString("hex"),
          source: "signup",
        },
      });
      ticketCode = reg.ticketCode;
    }

    void sendAccountCreated({
      to: email,
      name,
      editionName: edition?.name ?? null,
      dashboardUrl,
      ticketCode,
      eventDate: edition ? "31 January 2027" : null,
      userId: user.id,
    }).catch(() => undefined);

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
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        Inv.ent · Create account
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-wide text-teal-deep">
        Sign up
      </h1>
      <p className="mt-3 text-ink-soft">
        Name and email only. Profile details come after — never a gate.
      </p>

      {params.error === "exists" ? (
        <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
          That email is already registered.{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
          .
        </p>
      ) : null}
      {params.error === "invalid" ? (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          Use a name, valid email, and password of at least 8 characters.
        </p>
      ) : null}

      <form action={signupAction} className="mt-8 space-y-5">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <label className="block">
          <span className="text-sm font-medium text-ink">Name</span>
          <input
            name="name"
            required
            autoComplete="name"
            className="mt-1.5 w-full rounded-md border border-line bg-white px-3 py-2.5 outline-none focus:border-teal"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="mt-1.5 w-full rounded-md border border-line bg-white px-3 py-2.5 outline-none focus:border-teal"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Password</span>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1.5 w-full rounded-md border border-line bg-white px-3 py-2.5 outline-none focus:border-teal"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-md bg-teal-deep px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-white hover:bg-teal"
        >
          Create account
        </button>
      </form>

      <p className="mt-8 text-sm text-mute">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-teal-deep underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
