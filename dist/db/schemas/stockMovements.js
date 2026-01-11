"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockMovements = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const _timestamps_1 = require("./_timestamps");
exports.stockMovements = (0, sqlite_core_1.sqliteTable)("stock_movements", Object.assign({ id: (0, sqlite_core_1.text)("id").primaryKey().notNull(), stockId: (0, sqlite_core_1.text)("stock_id").notNull(), type: (0, sqlite_core_1.text)("type", { enum: ["add", "deduct"] }).notNull(), quantity: (0, sqlite_core_1.integer)("quantity").notNull(), reason: (0, sqlite_core_1.text)("reason"), performedBy: (0, sqlite_core_1.text)("performed_by") }, _timestamps_1.timestamps));
