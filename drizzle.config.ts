// // drizzle.config.ts
// import { defineConfig } from "drizzle-kit";

// export default defineConfig({
//   dialect: "sqlite", // Turso libSQL → sqlite dialect use hota hai
//   schema: "./db/schema.ts", // apna schema file yahan daalo
//   out: "./drizzle/migrations", // migrations folder
//   dbCredentials: {
//     url: process.env.TURSO_DATABASE_URL!,
//     authToken: process.env.TURSO_AUTH_TOKEN!,
//   },
//   verbose: true,
// });

// drizzle.config.ts
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "turso",                           // ← this fixes the error
  schema: "./db/schemas/index.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,     // libsql://...
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
  verbose: true,
  strict: true,
});
