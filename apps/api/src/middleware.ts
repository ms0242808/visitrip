import type { MiddlewareHandler } from "hono";
import { auth, type AuthSession } from "./auth";

export type Variables = { session: AuthSession };

export const requireAuth: MiddlewareHandler<{ Variables: Variables }> = async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "unauthorized" }, 401);
  c.set("session", session);
  await next();
};
