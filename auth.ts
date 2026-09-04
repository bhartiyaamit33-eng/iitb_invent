import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { Provider } from "next-auth/providers";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { isAdminEmail } from "@/lib/auth/roles";
import { ensureAttendeeReady } from "@/lib/auth/attendee";

const providers: Provider[] = [
  Credentials({
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = String(credentials?.email ?? "")
        .trim()
        .toLowerCase();
      const password = String(credentials?.password ?? "");
      if (!email || !password) return null;

      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          passwordHash: true,
          image: true,
          deletedAt: true,
        },
      });
      if (!user?.passwordHash || user.deletedAt) return null;

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return null;

      let role = user.role;
      if (role === Role.ADMIN && !isAdminEmail(user.email)) {
        role = Role.ATTENDEE;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role,
      };
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

if (process.env.AUTH_LINKEDIN_ID && process.env.AUTH_LINKEDIN_SECRET) {
  providers.push(
    LinkedIn({
      clientId: process.env.AUTH_LINKEDIN_ID,
      clientSecret: process.env.AUTH_LINKEDIN_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: { scope: "openid profile email" },
      },
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async signIn({ user }) {
      if (user?.id) {
        await ensureAttendeeReady(user.id);
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id! },
          select: { role: true, email: true },
        });
        let role = dbUser?.role ?? Role.ATTENDEE;
        if (role === Role.ADMIN && !isAdminEmail(dbUser?.email)) {
          role = Role.ATTENDEE;
        }
        // OAuth brand-new users: never elevate via login CTA
        if (
          role === Role.ADMIN &&
          dbUser?.email &&
          !isAdminEmail(dbUser.email)
        ) {
          role = Role.ATTENDEE;
        }
        token.role = role;
        token.email = dbUser?.email ?? user.email;
      }
      if (trigger === "update" && session) {
        token.name = session.name ?? token.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : "";
        session.user.role =
          (token.role as Role | undefined) ?? Role.ATTENDEE;
        if (typeof token.email === "string") {
          session.user.email = token.email;
        }
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.id) await ensureAttendeeReady(user.id);
    },
  },
});

export function oauthProvidersEnabled() {
  return {
    google: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
    linkedin: Boolean(
      process.env.AUTH_LINKEDIN_ID && process.env.AUTH_LINKEDIN_SECRET,
    ),
  };
}
