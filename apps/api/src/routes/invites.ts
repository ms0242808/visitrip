import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import type { InvitePreview } from "@visitrip/shared";
import { schema } from "@visitrip/db";
import { auth } from "../auth";
import { db } from "../db";

export const invitesRouter = new Hono();

invitesRouter.get("/:token", async (c) => {
  const token = c.req.param("token");
  if (!token) return c.json({ error: "not_found" }, 404);

  const [invite] = await db
    .select()
    .from(schema.tripInvite)
    .where(eq(schema.tripInvite.token, token));
  if (!invite || invite.revoked) return c.json({ error: "not_found" }, 404);

  const [tripRow] = await db.select().from(schema.trip).where(eq(schema.trip.id, invite.tripId));
  if (!tripRow) return c.json({ error: "not_found" }, 404);

  const members = await db
    .select()
    .from(schema.tripMember)
    .where(eq(schema.tripMember.tripId, tripRow.id));
  const [inviterRow] = await db.select().from(schema.user).where(eq(schema.user.id, invite.createdBy));

  const body: InvitePreview = {
    token: invite.token,
    role: invite.role as InvitePreview["role"],
    trip: {
      id: tripRow.id,
      title: tripRow.title,
      location: tripRow.location,
      cover: tripRow.cover as InvitePreview["trip"]["cover"],
      startDate: tripRow.startDate,
      endDate: tripRow.endDate,
      memberCount: members.length,
    },
    inviter: {
      id: invite.createdBy,
      name: inviterRow?.name ?? "Someone",
    },
  };
  return c.json(body);
});

invitesRouter.post("/:token/accept", async (c) => {
  const token = c.req.param("token");
  if (!token) return c.json({ error: "not_found" }, 404);

  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "unauthorized" }, 401);

  const [invite] = await db
    .select()
    .from(schema.tripInvite)
    .where(eq(schema.tripInvite.token, token));
  if (!invite || invite.revoked) return c.json({ error: "not_found" }, 404);

  const [existing] = await db
    .select()
    .from(schema.tripMember)
    .where(
      and(
        eq(schema.tripMember.tripId, invite.tripId),
        eq(schema.tripMember.userId, session.user.id),
      ),
    );
  if (!existing) {
    await db.insert(schema.tripMember).values({
      tripId: invite.tripId,
      userId: session.user.id,
      role: invite.role,
    });
  }
  return c.json({ tripId: invite.tripId });
});
