"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agencies = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const _timestamps_1 = require("./_timestamps");
exports.agencies = (0, sqlite_core_1.sqliteTable)("agencies", Object.assign({ 
    // 🔥 RANDOM ID (like YouTube)
    id: (0, sqlite_core_1.text)("id").primaryKey().notNull(), name: (0, sqlite_core_1.text)("name").notNull(), 
    // owner_admin user id
    ownerId: (0, sqlite_core_1.text)("owner_id").notNull() }, _timestamps_1.timestamps), (t) => [(0, sqlite_core_1.uniqueIndex)("agencies_owner_idx").on(t.ownerId)]);
