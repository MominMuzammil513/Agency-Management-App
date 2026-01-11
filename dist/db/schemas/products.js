"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.products = void 0;
// db/schemas/products.ts
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const _timestamps_1 = require("./_timestamps");
exports.products = (0, sqlite_core_1.sqliteTable)("products", Object.assign({ id: (0, sqlite_core_1.text)("id").primaryKey().notNull(), name: (0, sqlite_core_1.text)("name").notNull(), categoryId: (0, sqlite_core_1.text)("category_id").notNull(), agencyId: (0, sqlite_core_1.text)("agency_id").notNull(), purchasePrice: (0, sqlite_core_1.integer)("purchase_price").notNull(), sellingPrice: (0, sqlite_core_1.integer)("selling_price").notNull(), imageUrl: (0, sqlite_core_1.text)("image_url").notNull() }, _timestamps_1.timestamps));
