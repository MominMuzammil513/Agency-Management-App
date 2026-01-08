// types/next-auth.d.ts (Corrected & Working Version)
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    role: "super_admin" | "owner_admin" | "salesman" | "delivery_boy";
    agencyId?: string | null; // ← Optional – super_admin ke paas nahi hota
  }

  interface Session {
    user: {
      id: string;
      role: "super_admin" | "owner_admin" | "salesman" | "delivery_boy";
      agencyId?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "super_admin" | "owner_admin" | "salesman" | "delivery_boy";
    agencyId?: string | null;
  }
}
