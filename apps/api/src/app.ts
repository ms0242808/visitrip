import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { Deps } from "./deps";
import { activityRouter } from "./routes/activity";
import { invitesRouter } from "./routes/invites";
import { meRouter } from "./routes/me";
import { tripsRouter } from "./routes/trips";

export function createApp(deps: Deps) {
  const app = new Hono();

  app.use("*", logger());
  app.use("*", cors({ origin: deps.webOrigin, credentials: true }));

  app.onError((err, c) => {
    console.error("[api] unhandled", err);
    return c.json({ error: "internal_error" }, 500);
  });

  app.get("/health", (c) => c.json({ status: "ok" }));

  app.on(["GET", "POST"], "/api/auth/*", (c) => deps.auth.handler(c.req.raw));

  app.route("/api/trips", tripsRouter);
  app.route("/api/invites", invitesRouter);
  app.route("/api/me", meRouter);
  app.route("/api/activity", activityRouter);

  return app;
}
