"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timestamps = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
exports.timestamps = {
    createdAt: (0, sqlite_core_1.text)("created_at")
        .notNull()
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, sqlite_core_1.text)("updated_at")
        .notNull()
        .$onUpdate(() => (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    deletedAt: (0, sqlite_core_1.text)("deleted_at"),
};
