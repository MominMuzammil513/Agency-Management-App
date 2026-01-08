import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestamps } from "./_timestamps";

export const areas = sqliteTable("areas", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),

  // belongs to agency
  agencyId: text("agency_id").notNull(),

  ...timestamps,
});
