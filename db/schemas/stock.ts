
import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { timestamps } from "./_timestamps";

export const stock = sqliteTable(
  "stock",
  {
    id: text("id").primaryKey().notNull(),

    productId: text("product_id").notNull(),
    agencyId: text("agency_id").notNull(),

    quantity: integer("quantity").notNull().default(0),

    ...timestamps,
  },
  (t) => [uniqueIndex("stock_unique").on(t.productId, t.agencyId)]
);
