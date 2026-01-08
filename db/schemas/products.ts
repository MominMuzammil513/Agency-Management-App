// db/schemas/products.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { timestamps } from "./_timestamps";

export const products = sqliteTable("products", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  categoryId: text("category_id").notNull(),
  agencyId: text("agency_id").notNull(),
  purchasePrice: integer("purchase_price").notNull(),
  sellingPrice: integer("selling_price").notNull(),
  imageUrl: text("image_url").notNull(), // ✅ new field
  ...timestamps,
});
