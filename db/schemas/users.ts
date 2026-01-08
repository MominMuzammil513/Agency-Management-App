import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { timestamps } from "./_timestamps";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey().notNull(),

    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),

    name: text("name").notNull(),
    mobile: text("mobile").notNull(),
    altMobile: text("alt_mobile"),

    role: text("role", {
      enum: ["super_admin", "owner_admin", "salesman", "delivery_boy"],
    }).notNull(),

    // 🔥 NO references here
    agencyId: text("agency_id"),

    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),

    mustResetPassword: integer("must_reset_password", {
      mode: "boolean",
    })
      .notNull()
      .default(false),

    ...timestamps,
  },
  (t) => [
    uniqueIndex("users_email_idx").on(t.email),
    index("users_role_idx").on(t.role),
    index("users_agency_idx").on(t.agencyId),
    index("users_active_idx").on(t.isActive),
  ]
);
