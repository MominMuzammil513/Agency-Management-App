// test-env.ts
console.log("TURSO_DATABASE_URL:", process.env.TURSO_DATABASE_URL);
console.log(
  "TURSO_AUTH_TOKEN:",
  process.env.TURSO_AUTH_TOKEN ? "present (hidden)" : "missing"
);
