import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestamps } from "./_timestamps";

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey().notNull(),

  orderId: text("order_id").notNull(),
  productId: text("product_id").notNull(),

  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(), // snapshot of product price at order time

  ...timestamps,
});