import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/db/db";
import { users } from "@/db/schemas";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
// ------------------------------
// NextAuth Options
// ------------------------------
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      type: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Fetch user from DB
        const [user] = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            passwordHash: users.passwordHash,
            role: users.role,
            agencyId: users.agencyId, // ← Yeh line zaroori hai!
          })
          .from(users)
          .where(eq(users.email, credentials.email.toLowerCase()))
          .limit(1);

        if (!user || !user.passwordHash) return null;

        // Verify password
        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!isValid) return null;

        // Return typed user object (TS safe)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          agencyId: user.agencyId,
          role: user.role as
            | "super_admin"
            | "owner_admin"
            | "salesman"
            | "delivery_boy",
        } as const;
      },
    }),
  ],

  pages: {
    signIn: "/login", // Custom login page
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    // Add role and id to JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
        token.agencyId = user.agencyId;
      }
      return token;
    },

    // Make role and id available in session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as
          | "super_admin"
          | "owner_admin"
          | "salesman"
          | "delivery_boy";
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.agencyId = token.agencyId as string;
      }
      return session;
    },
  },
};
