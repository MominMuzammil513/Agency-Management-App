
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { timestamps } from "./_timestamps";

export const stockMovements = sqliteTable("stock_movements", {
  id: text("id").primaryKey().notNull(),

  stockId: text("stock_id").notNull(), // references stock.id
  type: text("type", { enum: ["add", "deduct"] }).notNull(), // add = new stock, deduct = delivery/order
  quantity: integer("quantity").notNull(),
  reason: text("reason"), // "New purchase", "Order #123 delivered"
  performedBy: text("performed_by"), // user id

  ...timestamps,
});
