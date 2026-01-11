"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const _timestamps_1 = require("./_timestamps");
exports.users = (0, sqlite_core_1.sqliteTable)("users", Object.assign({ id: (0, sqlite_core_1.text)("id").primaryKey().notNull(), email: (0, sqlite_core_1.text)("email").notNull(), passwordHash: (0, sqlite_core_1.text)("password_hash").notNull(), name: (0, sqlite_core_1.text)("name").notNull(), mobile: (0, sqlite_core_1.text)("mobile").notNull(), altMobile: (0, sqlite_core_1.text)("alt_mobile"), role: (0, sqlite_core_1.text)("role", {
        enum: ["super_admin", "owner_admin", "salesman", "delivery_boy"],
    }).notNull(), 
    // 🔥 NO references here
    agencyId: (0, sqlite_core_1.text)("agency_id"), isActive: (0, sqlite_core_1.integer)("is_active", { mode: "boolean" }).notNull().default(true), mustResetPassword: (0, sqlite_core_1.integer)("must_reset_password", {
        mode: "boolean",
    })
        .notNull()
        .default(false) }, _timestamps_1.timestamps), (t) => [
    (0, sqlite_core_1.uniqueIndex)("users_email_idx").on(t.email),
    (0, sqlite_core_1.index)("users_role_idx").on(t.role),
    (0, sqlite_core_1.index)("users_agency_idx").on(t.agencyId),
    (0, sqlite_core_1.index)("users_active_idx").on(t.isActive),
]);
