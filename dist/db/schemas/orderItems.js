"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderItems = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const _timestamps_1 = require("./_timestamps");
exports.orderItems = (0, sqlite_core_1.sqliteTable)("order_items", Object.assign({ id: (0, sqlite_core_1.text)("id").primaryKey().notNull(), orderId: (0, sqlite_core_1.text)("order_id").notNull(), productId: (0, sqlite_core_1.text)("product_id").notNull(), quantity: (0, sqlite_core_1.integer)("quantity").notNull(), price: (0, sqlite_core_1.integer)("price").notNull() }, _timestamps_1.timestamps));
