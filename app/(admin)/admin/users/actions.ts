"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { requireAdmin, canHoldAdminRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/admin/audit";
import { deleteUserAccount } from "@/lib/users/delete";
import { ensureAttendeeReady } from "@/lib/auth/attendee";

const IMPORTABLE_ROLES = new Set<Role>([
  Role.ATTENDEE,
  Role.SPEAKER,
  Role.VOLUNTEER,
  Role.ORGANISER,
]);

function parseRole(raw: string): Role {
  const upper = raw.trim().toUpperCase();
  if (IMPORTABLE_ROLES.has(upper as Role)) return upper as Role;
  return Role.ATTENDEE;
}

export type ImportUsersResult = {
  created: number;
  skipped: number;
  errors: string[];
};

export async function importUsersCsvAction(
  formData: FormData,
): Promise<ImportUsersResult> {
  const actor = await getCurrentUser();
  requireAdmin(actor);

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { created: 0, skipped: 0, errors: ["Choose a CSV file"] };
  }

  const text = await file.text();
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) {
    return { created: 0, skipped: 0, errors: ["CSV is empty"] };
  }

  const headerCells = splitCsvLine(lines[0]!).map((c) => c.toLowerCase());
  const hasHeader =
    headerCells.includes("email") || headerCells[0] === "email";
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const emailIdx = hasHeader ? Math.max(0, headerCells.indexOf("email")) : 0;
  const nameIdx = hasHeader
    ? headerCells.indexOf("name") >= 0
      ? headerCells.indexOf("name")
      : 1
    : 1;
  const roleIdx = hasHeader ? headerCells.indexOf("role") : 2;

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const line of dataLines) {
    const cells = splitCsvLine(line);
    const email = (cells[emailIdx] ?? "").trim().toLowerCase();
    const name = (cells[nameIdx] ?? "").trim() || email.split("@")[0] || "Guest";
    if (!email || !email.includes("@")) {
      errors.push(`Invalid email: ${line.slice(0, 40)}`);
      continue;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      skipped += 1;
      continue;
    }

    let role = roleIdx >= 0 ? parseRole(cells[roleIdx] ?? "") : Role.ATTENDEE;
    if ((cells[roleIdx] ?? "").trim().toUpperCase() === "ADMIN") {
      if (canHoldAdminRole(email)) {
        role = Role.ADMIN;
      } else {
        role = Role.ATTENDEE;
        errors.push(
          `${email}: ADMIN role denied (not allowlisted); imported as ATTENDEE`,
        );
      }
    }

    const tempPassword = randomBytes(18).toString("base64url");
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    try {
      const user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          role,
          emailVerified: null,
          profile: {
            create: { completeness: 0, directoryOptIn: false },
          },
        },
      });
      await ensureAttendeeReady(user.id);
      created += 1;
    } catch (e) {
      errors.push(
        `${email}: ${e instanceof Error ? e.message : "create failed"}`,
      );
    }
  }

  await writeAuditLog({
    actorId: actor!.id,
    action: "user.import",
    entityType: "User",
    after: { created, skipped, errorCount: errors.length },
  });

  revalidatePath("/admin/users");
  return { created, skipped, errors: errors.slice(0, 20) };
}

export async function adminDeleteUserAction(formData: FormData) {
  const actor = await getCurrentUser();
  requireAdmin(actor);

  const userId = String(formData.get("userId") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (!userId) throw new Error("Missing user");
  if (confirm !== "DELETE") {
    redirect(`/admin/users?error=confirm`);
  }

  const result = await deleteUserAccount(userId, { actorId: actor!.id });
  if (!result.ok) {
    redirect(`/admin/users?error=${encodeURIComponent(result.error)}`);
  }

  await writeAuditLog({
    actorId: actor!.id,
    action: "user.delete",
    entityType: "User",
    entityId: userId,
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?deleted=1");
}

/** Minimal CSV line splitter (handles quoted fields). */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}
