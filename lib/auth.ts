import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("[auth] Missing email or password");
            return null;
          }

          const user = await db
            .select()
            .from(adminUsers)
            .where(eq(adminUsers.email, credentials.email as string))
            .get();

          if (!user) {
            console.error("[auth] User not found:", credentials.email);
            return null;
          }

          if (user.status !== "active") {
            console.error("[auth] User inactive:", user.status);
            return null;
          }

          const isValid = await compare(credentials.password as string, user.passwordHash);
          if (!isValid) {
            console.error("[auth] Password mismatch for:", credentials.email);
            return null;
          }

          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
          };
        } catch (err) {
          console.error("[auth] authorize error:", err);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
});
