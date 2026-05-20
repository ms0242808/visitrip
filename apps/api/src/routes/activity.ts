import { Hono } from "hono";
import { and, desc, eq, inArray } from "drizzle-orm";
import type { ActivityEvent, CoverKind } from "@visitrip/shared";
import { schema } from "@visitrip/db";
import { db } from "../db";
import { requireAuth, type Variables } from "../middleware";

export const activityRouter = new Hono<{ Variables: Variables }>();

activityRouter.use("*", requireAuth);

activityRouter.get("/", async (c) => {
  const session = c.get("session");
  const userId = session.user.id;
  const requestedTripId = c.req.query("tripId");
  const limitParam = Number(c.req.query("limit") ?? "50");
  const limit = Math.min(Math.max(1, isFinite(limitParam) ? limitParam : 50), 200);

  const memberships = await db
    .select({ tripId: schema.tripMember.tripId })
    .from(schema.tripMember)
    .where(eq(schema.tripMember.userId, userId));
  let tripIds = memberships.map((m) => m.tripId);
  if (requestedTripId) {
    tripIds = tripIds.filter((id) => id === requestedTripId);
  }
  if (tripIds.length === 0) return c.json({ events: [] });

  const [trips, members, expenses, invites, docs, users] = await Promise.all([
    db.select().from(schema.trip).where(inArray(schema.trip.id, tripIds)),
    db
      .select()
      .from(schema.tripMember)
      .where(inArray(schema.tripMember.tripId, tripIds)),
    db
      .select()
      .from(schema.expense)
      .where(inArray(schema.expense.tripId, tripIds))
      .orderBy(desc(schema.expense.createdAt))
      .limit(limit),
    db
      .select()
      .from(schema.tripInvite)
      .where(and(inArray(schema.tripInvite.tripId, tripIds), eq(schema.tripInvite.revoked, false)))
      .orderBy(desc(schema.tripInvite.createdAt))
      .limit(limit),
    db
      .select()
      .from(schema.tripDoc)
      .where(inArray(schema.tripDoc.tripId, tripIds))
      .orderBy(desc(schema.tripDoc.createdAt))
      .limit(limit),
    db.select().from(schema.user),
  ]);

  const userById = new Map(users.map((u) => [u.id, u]));
  const tripById = new Map(trips.map((t) => [t.id, t]));
  const tripMeta = (tripId: string) => {
    const t = tripById.get(tripId);
    return {
      tripId,
      tripTitle: t?.title ?? "(unknown)",
      tripCover: (t?.cover ?? "cover-lisbon") as CoverKind,
    };
  };
  const actorMeta = (id: string) => ({
    actorId: id,
    actorName: userById.get(id)?.name ?? "Someone",
  });

  const events: ActivityEvent[] = [];

  for (const trip of trips) {
    events.push({
      id: `trip:${trip.id}`,
      kind: "trip_created",
      ...tripMeta(trip.id),
      ...actorMeta(trip.ownerId),
      createdAt: trip.createdAt.toISOString(),
      payload: { title: trip.title, location: trip.location },
    });
  }

  for (const m of members) {
    // The owner's auto-membership is co-incident with trip creation; suppress it
    // to avoid a duplicate "joined" event right next to "trip_created".
    const trip = tripById.get(m.tripId);
    if (trip && trip.ownerId === m.userId && Math.abs(trip.createdAt.getTime() - m.joinedAt.getTime()) < 2_000) {
      continue;
    }
    events.push({
      id: `member:${m.tripId}:${m.userId}`,
      kind: "member_joined",
      ...tripMeta(m.tripId),
      ...actorMeta(m.userId),
      createdAt: m.joinedAt.toISOString(),
      payload: { role: m.role },
    });
  }

  for (const e of expenses) {
    events.push({
      id: `expense:${e.id}`,
      kind: "expense_added",
      ...tripMeta(e.tripId),
      ...actorMeta(e.paidById),
      createdAt: e.createdAt.toISOString(),
      payload: {
        label: e.label,
        amountCents: e.amountCents,
        currency: e.currency,
      },
    });
  }

  for (const inv of invites) {
    events.push({
      id: `invite:${inv.id}`,
      kind: "invite_created",
      ...tripMeta(inv.tripId),
      ...actorMeta(inv.createdBy),
      createdAt: inv.createdAt.toISOString(),
      payload: { role: inv.role },
    });
  }

  for (const d of docs) {
    events.push({
      id: `doc:${d.id}`,
      kind: "doc_added",
      ...tripMeta(d.tripId),
      ...actorMeta(d.ownerId),
      createdAt: d.createdAt.toISOString(),
      payload: { label: d.label, kind: d.kind },
    });
  }

  events.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return c.json({ events: events.slice(0, limit) });
});
