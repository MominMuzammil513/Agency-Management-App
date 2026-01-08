// import { sql } from "drizzle-orm";
// import {
//   integer,
//   text,
//   sqliteTable,
//   index,
//   uniqueIndex,
// } from "drizzle-orm/sqlite-core";

// /* ───────────────────
//    Common timestamps
// ─────────────────── */
// export const timestamps = {
//   createdAt: text("created_at")
//     .notNull()
//     .default(sql`CURRENT_TIMESTAMP`),

//   updatedAt: text("updated_at")
//     .notNull()
//     .$onUpdate(() => sql`CURRENT_TIMESTAMP`),

//   deletedAt: text("deleted_at"), // soft delete
// };

// export const users = sqliteTable(
//   "users",
//   {
//     id: text("id").primaryKey().notNull(), // crypto ID

//     email: text("email").notNull(),
//     passwordHash: text("password_hash").notNull(),

//     name: text("name").notNull(),
//     mobile: text("mobile").notNull(),
//     altMobile: text("alt_mobile"),

//     role: text("role", {
//       enum: ["super_admin", "owner_admin", "salesman", "delivery_boy"],
//     }).notNull(),

//     agencyId: integer("agency_id").references(() => agencies.id, {
//       onDelete: "set null",
//     }),

//     isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),

//     mustResetPassword: integer("must_reset_password", {
//       mode: "boolean",
//     })
//       .notNull()
//       .default(false),

//     ...timestamps,
//   },
//   (t) => [
//     uniqueIndex("users_email_idx").on(t.email),
//     index("users_role_idx").on(t.role),
//     index("users_agency_idx").on(t.agencyId),
//     index("users_active_idx").on(t.isActive),
//   ]
// );

// export const agencies = sqliteTable(
//   "agencies",
//   {
//     id: integer("id").primaryKey({ autoIncrement: true }),

//     name: text("name").notNull(),
//     city: text("city").notNull(),
//     address: text("address"),

//     // ✅ FIXED: TEXT instead of INTEGER
//     ownerId: text("owner_id")
//       .notNull()
//       .references(() => users.id, {
//         onDelete: "cascade",
//       }),

//     ...timestamps,
//   },
//   (t) => [
//     index("agencies_city_idx").on(t.city),
//     uniqueIndex("agencies_owner_idx").on(t.ownerId),
//   ]
// );

// // ── Remaining Tables (All with Lazy References) ──────────────────────────────
// export const areas = sqliteTable(
//   "areas",
//   {
//     id: integer("id").primaryKey({ autoIncrement: true }),
//     agencyId: integer("agency_id")
//       .notNull()
//       .references(() => agencies.id, { onDelete: "cascade" }),
//     name: text("name").notNull(),
//     address: text("address"),
//     pincode: text("pincode"),
//     latitude: real("latitude"),
//     longitude: real("longitude"),
//     createdBy: integer("created_by").references(() => users.id),
//     ...timestamps,
//   },
//   (table) => [
//     index("areas_agency_idx").on(table.agencyId),
//     index("areas_name_idx").on(table.name),
//   ]
// );

// export const products = sqliteTable(
//   "products",
//   {
//     id: integer("id").primaryKey({ autoIncrement: true }),
//     agencyId: integer("agency_id")
//       .notNull()
//       .references(() => agencies.id, { onDelete: "cascade" }),
//     name: text("name").notNull(),
//     sku: text("sku"),
//     description: text("description"),
//     purchasePrice: real("purchase_price").notNull(),
//     sellingPrice: real("selling_price").notNull(),
//     unit: text("unit").notNull(),
//     ...timestamps,
//   },
//   (table) => [
//     index("products_agency_idx").on(table.agencyId),
//     uniqueIndex("products_sku_idx").on(table.sku),
//   ]
// );

// export const stock = sqliteTable(
//   "stock",
//   {
//     id: integer("id").primaryKey({ autoIncrement: true }),
//     productId: integer("product_id")
//       .notNull()
//       .references(() => products.id, { onDelete: "cascade" }),
//     agencyId: integer("agency_id")
//       .notNull()
//       .references(() => agencies.id, { onDelete: "cascade" }),
//     quantity: real("quantity").notNull().default(0),
//     ...timestamps,
//   },
//   (table) => [
//     uniqueIndex("stock_product_agency_idx").on(table.productId, table.agencyId),
//   ]
// );

// export const dailySchedules = sqliteTable(
//   "daily_schedules",
//   {
//     id: integer("id").primaryKey({ autoIncrement: true }),
//     agencyId: integer("agency_id")
//       .notNull()
//       .references(() => agencies.id, { onDelete: "cascade" }),
//     salesmanId: integer("salesman_id")
//       .notNull()
//       .references(() => users.id, { onDelete: "cascade" }),
//     areaId: integer("area_id")
//       .notNull()
//       .references(() => areas.id, { onDelete: "cascade" }),
//     date: text("date").notNull(),
//     createdBy: integer("created_by").references(() => users.id),
//   },
//   (table) => [
//     uniqueIndex("schedules_salesman_date_idx").on(table.salesmanId, table.date),
//     index("schedules_agency_date_idx").on(table.agencyId, table.date),
//   ]
// );

// export const orders = sqliteTable(
//   "orders",
//   {
//     id: integer("id").primaryKey({ autoIncrement: true }),
//     agencyId: integer("agency_id")
//       .notNull()
//       .references(() => agencies.id, { onDelete: "cascade" }),
//     areaId: integer("area_id").references(() => areas.id),
//     salesmanId: integer("salesman_id").references(() => users.id),
//     deliveryBoyId: integer("delivery_boy_id").references(() => users.id),
//     orderNumber: text("order_number").notNull(),
//     status: text("status", {
//       enum: [
//         "draft",
//         "confirmed",
//         "loaded",
//         "out_for_delivery",
//         "delivered",
//         "paid",
//         "cancelled",
//       ],
//     })
//       .notNull()
//       .default("draft"),
//     totalAmount: real("total_amount").notNull().default(0),
//     paidAmount: real("paid_amount").default(0),
//     ...timestamps,
//     deliveredAt: text("delivered_at"),
//     paidAt: text("paid_at"),
//   },
//   (table) => [
//     index("orders_agency_idx").on(table.agencyId),
//     index("orders_status_idx").on(table.status),
//     uniqueIndex("orders_number_idx").on(table.orderNumber),
//   ]
// );

// export const orderItems = sqliteTable(
//   "order_items",
//   {
//     id: integer("id").primaryKey({ autoIncrement: true }),
//     orderId: integer("order_id")
//       .notNull()
//       .references(() => orders.id, { onDelete: "cascade" }),
//     productId: integer("product_id")
//       .notNull()
//       .references(() => products.id, { onDelete: "cascade" }),
//     quantity: real("quantity").notNull(),
//     price: real("price").notNull(),
//     total: real("total").notNull(),
//   },
//   (table) => [index("order_items_order_idx").on(table.orderId)]
// );

// export const payments = sqliteTable("payments", {
//   id: integer("id").primaryKey({ autoIncrement: true }),
//   orderId: integer("order_id")
//     .notNull()
//     .references(() => orders.id, { onDelete: "cascade" }),
//   amount: real("amount").notNull(),
//   method: text("method").notNull(),
//   receivedBy: integer("received_by").references(() => users.id),
//   receivedAt: text("received_at"),
// });

// // ── Inferred Types (Export After All Tables – This Fixes All 'any' Errors) ────
// export type User = InferSelectModel<typeof users>;
// export type InsertUser = InferInsertModel<typeof users>;

// export type Agency = InferSelectModel<typeof agencies>;
// export type InsertAgency = InferInsertModel<typeof agencies>;

// export type Area = InferSelectModel<typeof areas>;
// export type InsertArea = InferInsertModel<typeof areas>;

// export type Product = InferSelectModel<typeof products>;
// export type InsertProduct = InferInsertModel<typeof products>;

// export type StockItem = InferSelectModel<typeof stock>;
// export type InsertStockItem = InferInsertModel<typeof stock>;

// export type DailySchedule = InferSelectModel<typeof dailySchedules>;
// export type InsertDailySchedule = InferInsertModel<typeof dailySchedules>;

// export type Order = InferSelectModel<typeof orders>;
// export type InsertOrder = InferInsertModel<typeof orders>;

// export type OrderItem = InferSelectModel<typeof orderItems>;
// export type InsertOrderItem = InferInsertModel<typeof orderItems>;

// export type Payment = InferSelectModel<typeof payments>;
// export type InsertPayment = InferInsertModel<typeof payments>
