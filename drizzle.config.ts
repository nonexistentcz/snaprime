import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/*.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Migrations need a session-friendly connection, not the transaction
    // pooler (port 6543) the app uses at runtime — use session mode (5432).
    host:     process.env.DB_HOST!,
    port:     5432,
    user:     process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
  },
});
