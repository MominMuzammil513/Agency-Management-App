import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { timestamps } from "./_timestamps";
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey().notNull(),

  shopId: text("shop_id").notNull(),
  agencyId: text("agency_id").notNull(),

  createdBy: text("created_by").notNull(), // user id (salesman/delivery boy)
  
  confirmedBy: text("confirmed_by"), // user id (owner_admin who confirmed the order)
  deliveredBy: text("delivered_by"), // user id (delivery_boy or owner_admin who delivered)

  status: text("status", {
    enum: ["pending", "confirmed", "delivered", "cancelled"],
  })
    .notNull()
    .default("pending"),

  ...timestamps,
});

