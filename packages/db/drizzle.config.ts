import { defineConfig } from "drizzle-kit";

process.loadEnvFile("../../.env");

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

export default defineConfig({
  schema: "./src/schema-pg.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: { url },
});
