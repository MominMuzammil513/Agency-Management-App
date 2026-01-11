import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    role: "super_admin" | "owner_admin" | "salesman" | "delivery_boy";
    agencyId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: "super_admin" | "owner_admin" | "salesman" | "delivery_boy";
      agencyId?: string | null;
    } & DefaultSession["user"];
  }
}

// Ye part add karna zaroori hai error hatane ke liye
declare module "next-auth/adapters" {
  interface AdapterUser extends DefaultUser {
    role: "super_admin" | "owner_admin" | "salesman" | "delivery_boy";
    agencyId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: "super_admin" | "owner_admin" | "salesman" | "delivery_boy";
    agencyId?: string | null;
  }
}