import { PersonaType } from "@prisma/client";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { saveProfileAction } from "./actions";
import { LinkedInUrlField } from "@/components/LinkedInUrlField";
import { ProfilePhotoUpload } from "@/components/ProfilePhotoUpload";
import { ProfileSavedBanner } from "@/components/ProfileSavedBanner";

const PERSONA_OPTIONS: { value: PersonaType; label: string }[] = [
  { value: "STUDENT", label: "Student" },
  { value: "FACULTY", label: "Faculty" },
  { value: "FOUNDER", label: "Founder" },
  { value: "INVESTOR", label: "Investor" },
  { value: "OPERATOR", label: "Operator" },
  { value: "RESEARCHER", label: "Researcher" },
  { value: "OTHER", label: "Other" },
];

type SearchParams = Promise<{ saved?: string; pct?: string; error?: string }>;

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { image: true },
  });

  const percent =
    sp.saved === "1" && sp.pct != null
      ? Number(sp.pct)
      : (profile?.completeness ?? 0);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        Profile · {profile?.completeness ?? 0}% complete
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
        Your profile
      </h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        All fields optional. Saves when you submit. Directory stays off until you
        opt in.
      </p>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-paper">
        <div
          className="h-full rounded-full bg-teal transition-[width]"
          style={{
            width: `${Math.min(100, Math.max(0, profile?.completeness ?? 0))}%`,
          }}
        />
      </div>

      <ProfileSavedBanner saved={sp.saved === "1"} percent={Number.isFinite(percent) ? percent : 0} />

      {sp.error === "linkedin" ? (
        <p
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          That LinkedIn value didn&apos;t look valid. Use your handle (e.g.{" "}
          <code className="text-xs">jane-doe</code>) or paste the full profile
          URL.
        </p>
      ) : null}

      <form action={saveProfileAction} className="mt-8 space-y-5 rounded-xl border border-line bg-white p-6">
        <ProfilePhotoUpload
          imageUrl={dbUser?.image ?? null}
          name={user.name}
        />

        <label className="block">
          <span className="text-sm font-medium">Name</span>
          <input
            name="name"
            defaultValue={user.name}
            className="mt-1.5 w-full rounded-md border border-line px-3 py-2.5 outline-none focus:border-teal"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Persona</span>
          <select
            name="personaType"
            defaultValue={profile?.personaType ?? ""}
            className="mt-1.5 w-full rounded-md border border-line px-3 py-2.5 outline-none focus:border-teal"
          >
            <option value="">Select…</option>
            {PERSONA_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium">Headline</span>
          <input
            name="headline"
            defaultValue={profile?.headline ?? ""}
            placeholder="Final year BS Economics, IIT Bombay"
            className="mt-1.5 w-full rounded-md border border-line px-3 py-2.5 outline-none focus:border-teal"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Organisation</span>
          <input
            name="organisation"
            defaultValue={profile?.organisation ?? ""}
            className="mt-1.5 w-full rounded-md border border-line px-3 py-2.5 outline-none focus:border-teal"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">City</span>
          <input
            name="city"
            defaultValue={profile?.city ?? ""}
            className="mt-1.5 w-full rounded-md border border-line px-3 py-2.5 outline-none focus:border-teal"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Bio</span>
          <textarea
            name="bio"
            rows={3}
            maxLength={500}
            defaultValue={profile?.bio ?? ""}
            className="mt-1.5 w-full rounded-md border border-line px-3 py-2.5 outline-none focus:border-teal"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Phone (for connection requests)</span>
          <input
            name="phone"
            defaultValue={profile?.phone ?? ""}
            placeholder="+91 …"
            className="mt-1.5 w-full rounded-md border border-line px-3 py-2.5 outline-none focus:border-teal"
          />
        </label>

        <LinkedInUrlField defaultValue={profile?.linkedinUrl} />

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium">Website</span>
            <input
              name="websiteUrl"
              defaultValue={profile?.websiteUrl ?? ""}
              className="mt-1.5 w-full rounded-md border border-line px-3 py-2.5 outline-none focus:border-teal"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Twitter / X</span>
            <input
              name="twitterUrl"
              defaultValue={profile?.twitterUrl ?? ""}
              className="mt-1.5 w-full rounded-md border border-line px-3 py-2.5 outline-none focus:border-teal"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">GitHub</span>
            <input
              name="githubUrl"
              defaultValue={profile?.githubUrl ?? ""}
              className="mt-1.5 w-full rounded-md border border-line px-3 py-2.5 outline-none focus:border-teal"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium">Interests (comma-separated)</span>
          <input
            name="interests"
            defaultValue={(profile?.interests ?? []).join(", ")}
            placeholder="fintech, deeptech, climate"
            className="mt-1.5 w-full rounded-md border border-line px-3 py-2.5 outline-none focus:border-teal"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Looking for (comma-separated)</span>
          <input
            name="lookingFor"
            defaultValue={(profile?.lookingFor ?? []).join(", ")}
            placeholder="co-founder, hiring, raising"
            className="mt-1.5 w-full rounded-md border border-line px-3 py-2.5 outline-none focus:border-teal"
          />
        </label>

        <label className="flex items-start gap-3 rounded-lg border border-line bg-paper/60 px-4 py-3">
          <input
            type="checkbox"
            name="directoryOptIn"
            defaultChecked={profile?.directoryOptIn ?? false}
            className="mt-1"
          />
          <span className="text-sm text-ink-soft">
            <strong className="text-ink">Show me in the attendee directory.</strong>{" "}
            Your name, photo, headline and LinkedIn will be visible to other
            registered attendees of the current edition. Default is off.
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-lg border border-line px-4 py-3">
          <input
            type="checkbox"
            name="showEmail"
            defaultChecked={profile?.showEmail ?? false}
            className="mt-1"
          />
          <span className="text-sm text-ink-soft">
            Also show my email in the directory (separate from opt-in).
          </span>
        </label>

        <button
          type="submit"
          className="rounded-md bg-teal-deep px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-white hover:bg-teal"
        >
          Save profile
        </button>
      </form>
    </main>
  );
}
