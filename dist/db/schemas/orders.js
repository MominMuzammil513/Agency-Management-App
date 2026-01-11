"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orders = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const _timestamps_1 = require("./_timestamps");
exports.orders = (0, sqlite_core_1.sqliteTable)("orders", Object.assign({ id: (0, sqlite_core_1.text)("id").primaryKey().notNull(), shopId: (0, sqlite_core_1.text)("shop_id").notNull(), agencyId: (0, sqlite_core_1.text)("agency_id").notNull(), createdBy: (0, sqlite_core_1.text)("created_by").notNull(), status: (0, sqlite_core_1.text)("status", {
        enum: ["pending", "confirmed", "delivered", "cancelled"],
    })
        .notNull()
        .default("pending") }, _timestamps_1.timestamps));
