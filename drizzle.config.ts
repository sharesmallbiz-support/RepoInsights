import { defineConfig } from "drizzle-kit";

const dbPath = process.env.DATABASE_PATH || "./data/sqlite.db";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: dbPath,
  },
});
