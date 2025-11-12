import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "../shared/schema";
import { mkdirSync, existsSync } from "fs";
import { dirname } from "path";

/**
 * Get the database file path from environment or use default
 */
function getDatabasePath(): string {
  const dbPath = process.env.DATABASE_PATH || "./data/sqlite.db";

  // Ensure the directory exists
  const dir = dirname(dbPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  return dbPath;
}

/**
 * Initialize SQLite database connection
 */
export function initializeDatabase() {
  const dbPath = getDatabasePath();

  console.log(`Initializing SQLite database at: ${dbPath}`);

  // Create SQLite database connection
  const sqlite = new Database(dbPath);

  // Enable foreign keys
  sqlite.pragma("foreign_keys = ON");

  // Create Drizzle instance
  const db = drizzle(sqlite, { schema });

  // Run migrations if migrations folder exists
  try {
    migrate(db, { migrationsFolder: "./migrations" });
    console.log("✓ Database migrations applied successfully");
  } catch (error) {
    console.warn("⚠ No migrations to apply or migration failed:", error);
  }

  return { db, sqlite };
}

// Export singleton database instance
let dbInstance: ReturnType<typeof initializeDatabase> | null = null;

export function getDatabase() {
  if (!dbInstance) {
    dbInstance = initializeDatabase();
  }
  return dbInstance;
}
