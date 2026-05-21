import { drizzle } from "drizzle-orm/d1";
import { schema } from "@visitrip/db";
import { setDb } from "./db";
import { createAuth, setAuth } from "./auth";
import { createApp } from "./app";

export { TripDoc } from "./realtime/do";

interface Env {
  VISITRIP_DB: D1Database;
  TRIP_DO: DurableObjectNamespace;
  ASSETS: Fetcher;
  PUBLIC_URL: string;
  BETTER_AUTH_SECRET: string;
}

let app: ReturnType<typeof createApp> | null = null;
let authHandle: ReturnType<typeof createAuth> | null = null;

function init(env: Env) {
  if (app && authHandle) return;
  if (!env.BETTER_AUTH_SECRET) throw new Error("BETTER_AUTH_SECRET is required");
  if (!env.PUBLIC_URL) throw new Error("PUBLIC_URL is required");
  const db = drizzle(env.VISITRIP_DB, { schema });
  // D1 and postgres-js share the Drizzle query DSL; the Proxy in db.ts
  // forwards verbatim. The cast bridges the static type to either driver.
  setDb(db as unknown as Parameters<typeof setDb>[0]);
  authHandle = createAuth({
    db,
    provider: "sqlite",
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.PUBLIC_URL,
    trustedOrigins: [env.PUBLIC_URL],
  });
  setAuth(authHandle);
  app = createApp({ auth: authHandle, webOrigin: env.PUBLIC_URL });
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    init(env);
    const url = new URL(req.url);

    if (url.pathname === "/api/realtime" || url.pathname.startsWith("/api/realtime/")) {
      const tripId = url.searchParams.get("trip");
      if (!tripId) return new Response("Bad Request", { status: 400 });

      const session = await authHandle!.api.getSession({ headers: req.headers });
      if (!session) return new Response("Unauthorized", { status: 401 });

      const member = await env.VISITRIP_DB
        .prepare("SELECT 1 FROM trip_member WHERE trip_id = ? AND user_id = ? LIMIT 1")
        .bind(tripId, session.user.id)
        .first();
      if (!member) return new Response("Unauthorized", { status: 401 });

      const id = env.TRIP_DO.idFromName(tripId);
      return env.TRIP_DO.get(id).fetch(req);
    }

    if (url.pathname.startsWith("/api/") || url.pathname === "/health") {
      return app!.fetch(req, env, ctx);
    }

    return env.ASSETS.fetch(req);
  },
};
