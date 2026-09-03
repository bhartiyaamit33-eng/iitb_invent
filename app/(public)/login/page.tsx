import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";
import { isAdminEmail } from "@/lib/auth/roles";
import { Role } from "@prisma/client";

type SearchParams = Promise<{ callbackUrl?: string; error?: string }>;

function safeCallback(raw: string | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
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

  if (session?.user) {
    if (session.user.role === Role.ADMIN) {
      redirect(callbackUrl.startsWith("/admin") ? callbackUrl : "/admin");
    }
    redirect(callbackUrl === "/" ? "/dashboard" : callbackUrl);
  }

  async function loginAction(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") ?? "");
    const requested = safeCallback(String(formData.get("callbackUrl") ?? "/"));
    const next = isAdminEmail(email)
      ? requested.startsWith("/admin")
        ? requested
        : "/admin"
      : requested === "/"
        ? "/dashboard"
        : requested;

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

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        Inv.ent · Sign in
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-wide text-teal-deep">
        Login
      </h1>
      <p className="mt-3 text-ink-soft">
        Use your email and password. Organisers land on the admin console after
        sign-in.
      </p>

      {params.error ? (
        <p
          className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          Invalid email or password. Try again.
        </p>
      ) : null}

      <form action={loginAction} className="mt-8 space-y-5">
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
