import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestamps } from "./_timestamps";


export const shops = sqliteTable("shops", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),

  areaId: text("area_id").notNull(),
  agencyId: text("agency_id").notNull(),

  ownerName: text("owner_name"),
  mobile: text("mobile"),

  ...timestamps,
});
