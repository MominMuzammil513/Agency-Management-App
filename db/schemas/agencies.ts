import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { timestamps } from "./_timestamps";

export const agencies = sqliteTable(
  "agencies",
  {
    // 🔥 RANDOM ID (like YouTube)
    id: text("id").primaryKey().notNull(),

    name: text("name").notNull(),

    // owner_admin user id
    ownerId: text("owner_id").notNull(),

    ...timestamps,
  },
  (t) => [uniqueIndex("agencies_owner_idx").on(t.ownerId)]
);
