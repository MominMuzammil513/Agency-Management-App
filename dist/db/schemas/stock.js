"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stock = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const _timestamps_1 = require("./_timestamps");
exports.stock = (0, sqlite_core_1.sqliteTable)("stock", Object.assign({ id: (0, sqlite_core_1.text)("id").primaryKey().notNull(), productId: (0, sqlite_core_1.text)("product_id").notNull(), agencyId: (0, sqlite_core_1.text)("agency_id").notNull(), quantity: (0, sqlite_core_1.integer)("quantity").notNull().default(0) }, _timestamps_1.timestamps), (t) => [(0, sqlite_core_1.uniqueIndex)("stock_unique").on(t.productId, t.agencyId)]);
