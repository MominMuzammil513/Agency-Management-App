import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestamps } from "./_timestamps";

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),

  agencyId: text("agency_id").notNull(),

  ...timestamps,
});