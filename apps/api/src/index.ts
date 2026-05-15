import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

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

// TODO(auth): mount better-auth handler at /api/auth/*
// TODO(realtime): mount Yjs WebSocket server for collaborative trip editing

const port = Number(process.env.PORT ?? 3001);
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`api listening on http://localhost:${info.port}`);
});
