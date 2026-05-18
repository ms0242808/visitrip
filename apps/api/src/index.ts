import { serve } from "@hono/node-server";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import type { Server as HttpServer } from "node:http";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { runMigrations } from "@visitrip/db";
import { auth } from "./auth";
import { attachRealtime } from "./realtime/server";
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

app.get("/health", (c) => c.json({ status: "ok" }));

app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.route("/api/trips", tripsRouter);
app.route("/api/invites", invitesRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function maybeMigrate() {
  const flag = (process.env.AUTO_MIGRATE ?? "true").toLowerCase();
  if (flag === "false" || flag === "0") return;
  const url = process.env.DATABASE_URL;
  if (!url) return;
  const folder = process.env.MIGRATIONS_DIR ?? resolve(__dirname, "../migrations");
  console.log(`[api] running migrations from ${folder}`);
  await runMigrations(url, folder);
}

await maybeMigrate();

const port = Number(process.env.PORT ?? 3001);
const server = serve({ fetch: app.fetch, port }, (info) => {
  console.log(`api listening on http://localhost:${info.port}`);
});

attachRealtime(server as unknown as HttpServer);
