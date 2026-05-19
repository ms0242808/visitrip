import { serve } from "@hono/node-server";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import type { Server as HttpServer } from "node:http";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { runMigrations } from "@visitrip/db";
import { auth } from "./auth";
import { attachRealtime } from "./realtime/server";
import { flushAll } from "./realtime/docs";
import { invitesRouter } from "./routes/invites";
import { tripsRouter } from "./routes/trips";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  }),
);

app.onError((err, c) => {
  console.error("[api] unhandled", err);
  return c.json({ error: "internal_error" }, 500);
});

app.get("/health", (c) => c.json({ status: "ok" }));

app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.route("/api/trips", tripsRouter);
app.route("/api/invites", invitesRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function resolveMigrationsDir(): string {
  if (process.env.MIGRATIONS_DIR) return process.env.MIGRATIONS_DIR;
  // Docker image lays migrations next to dist/ (see apps/api/Dockerfile).
  const dockerLayout = resolve(__dirname, "../migrations");
  if (existsSync(dockerLayout)) return dockerLayout;
  // Local dev / source layout: drizzle-kit writes them to packages/db/migrations.
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
