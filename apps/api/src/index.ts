import { serve } from "@hono/node-server";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import type { Server as HttpServer } from "node:http";
import { createDb, runMigrations } from "@visitrip/db";
import { setDb } from "./db";
import { createAuth, setAuth } from "./auth";
import { createApp } from "./app";
import { attachRealtime } from "./realtime/server";
import { flushAll } from "./realtime/docs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function resolveMigrationsDir(): string {
  if (process.env.MIGRATIONS_DIR) return process.env.MIGRATIONS_DIR;
  const dockerLayout = resolve(__dirname, "../migrations");
  if (existsSync(dockerLayout)) return dockerLayout;
  return resolve(__dirname, "../../../packages/db/migrations");
}

async function maybeMigrate() {
  const flag = (process.env.AUTO_MIGRATE ?? "true").toLowerCase();
  if (flag === "false" || flag === "0") return;
  const url = process.env.DATABASE_URL;
  if (!url) return;
  const folder = resolveMigrationsDir();
  console.log(`[api] running migrations from ${folder}`);
  await runMigrations(url, folder);
}

await maybeMigrate();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const database = createDb(databaseUrl);
setDb(database);

const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:5173";
const auth = createAuth({
  db: database,
  provider: "pg",
  secret: process.env.BETTER_AUTH_SECRET ?? "",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
  trustedOrigins: [webOrigin],
});
setAuth(auth);

const app = createApp({ auth, webOrigin });

const port = Number(process.env.PORT ?? 3001);
const server = serve({ fetch: app.fetch, port }, (info) => {
  console.log(`api listening on http://localhost:${info.port}`);
});

const wss = attachRealtime(server as unknown as HttpServer);

let shuttingDown = false;
async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[api] received ${signal}, flushing Yjs state`);
  try {
    await flushAll();
  } catch (e) {
    console.error("[api] flushAll failed during shutdown", e);
  }
  for (const ws of wss.clients) {
    try {
      ws.terminate();
    } catch {}
  }
  wss.close();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 5000).unref();
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
