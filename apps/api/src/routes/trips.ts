import { Hono } from "hono";
import { asc, eq, inArray } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { zValidator } from "@hono/zod-validator";
import {
  createTripSchema,
  type TripDetail,
  type TripSummary,
} from "@visitrip/shared";
import { schema } from "@visitrip/db";
import { db } from "../db";
import { requireAuth, type Variables } from "../middleware";

export const tripsRouter = new Hono<{ Variables: Variables }>();

tripsRouter.use("*", requireAuth);

tripsRouter.get("/", async (c) => {
  const session = c.get("session");
  const memberships = await db
    .select({ tripId: schema.tripMember.tripId })
    .from(schema.tripMember)
    .where(eq(schema.tripMember.userId, session.user.id));
  const tripIds = memberships.map((m) => m.tripId);
  if (tripIds.length === 0) return c.json({ trips: [] });

  const rows = await db
    .select()
    .from(schema.trip)
    .where(inArray(schema.trip.id, tripIds))
    .orderBy(asc(schema.trip.startDate));

  const members = await db
    .select({ tripId: schema.tripMember.tripId })
    .from(schema.tripMember)
    .where(inArray(schema.tripMember.tripId, tripIds));

  const memberCountByTrip = new Map<string, number>();
  for (const m of members) {
    memberCountByTrip.set(m.tripId, (memberCountByTrip.get(m.tripId) ?? 0) + 1);
  }

  const trips: TripSummary[] = rows.map((t) => ({
    id: t.id,
    title: t.title,
    location: t.location,
    cover: t.cover as TripSummary["cover"],
    startDate: t.startDate,
    endDate: t.endDate,
    archived: t.archived,
    memberCount: memberCountByTrip.get(t.id) ?? 1,
  }));

  return c.json({ trips });
});

tripsRouter.post("/", zValidator("json", createTripSchema), async (c) => {
  const session = c.get("session");
  const input = c.req.valid("json");
  const id = randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(schema.trip).values({
      id,
      ownerId: session.user.id,
      title: input.title,
      location: input.location,
      cover: input.cover,
      startDate: input.startDate,
      endDate: input.endDate,
      summary: input.summary ?? "",
      currency: "USD",
      budgetTotalCents: 0,
      archived: false,
    });
    await tx.insert(schema.tripMember).values({
      tripId: id,
      userId: session.user.id,
      role: "owner",
    });
  });

  return c.json({ id }, 201);
});

tripsRouter.get("/:id", async (c) => {
  const session = c.get("session");
  const tripId = c.req.param("id");
  if (!tripId) return c.json({ error: "not_found" }, 404);

  const membership = await db
    .select()
    .from(schema.tripMember)
    .where(eq(schema.tripMember.tripId, tripId))
    .limit(50);
  if (!membership.find((m) => m.userId === session.user.id)) {
    return c.json({ error: "not_found" }, 404);
  }

  const [tripRow] = await db.select().from(schema.trip).where(eq(schema.trip.id, tripId));
  if (!tripRow) return c.json({ error: "not_found" }, 404);

  const memberUserIds = membership.map((m) => m.userId);
  const userRows = memberUserIds.length
    ? await db.select().from(schema.user).where(inArray(schema.user.id, memberUserIds))
    : [];
  const userById = new Map(userRows.map((u) => [u.id, u]));

  const days = await db
    .select()
    .from(schema.day)
    .where(eq(schema.day.tripId, tripId))
    .orderBy(asc(schema.day.position));
  const dayIds = days.map((d) => d.id);
  const items = dayIds.length
    ? await db
        .select()
        .from(schema.dayItem)
        .where(inArray(schema.dayItem.dayId, dayIds))
        .orderBy(asc(schema.dayItem.position))
    : [];
  const itemsByDay = new Map<string, typeof items>();
  for (const it of items) {
    const list = itemsByDay.get(it.dayId) ?? [];
    list.push(it);
    itemsByDay.set(it.dayId, list);
  }

  const expenses = await db
    .select()
    .from(schema.expense)
    .where(eq(schema.expense.tripId, tripId));
  const packing = await db
    .select()
    .from(schema.packingItem)
    .where(eq(schema.packingItem.tripId, tripId))
    .orderBy(asc(schema.packingItem.position));
  const docs = await db
    .select()
    .from(schema.tripDoc)
    .where(eq(schema.tripDoc.tripId, tripId));

  const detail: TripDetail = {
    id: tripRow.id,
    ownerId: tripRow.ownerId,
    title: tripRow.title,
    location: tripRow.location,
    cover: tripRow.cover as TripDetail["cover"],
    startDate: tripRow.startDate,
    endDate: tripRow.endDate,
    summary: tripRow.summary,
    currency: tripRow.currency,
    budgetTotalCents: tripRow.budgetTotalCents,
    archived: tripRow.archived,
    members: membership.map((m) => {
      const u = userById.get(m.userId);
      return {
        id: m.userId,
        name: u?.name ?? "Member",
        email: u?.email ?? "",
        role: m.role as TripDetail["members"][number]["role"],
      };
    }),
    days: days.map((d) => ({
      id: d.id,
      position: d.position,
      date: d.date,
      label: d.label,
      items: (itemsByDay.get(d.id) ?? []).map((it) => ({
        id: it.id,
        position: it.position,
        type: it.type as TripDetail["days"][number]["items"][number]["type"],
        time: it.time,
        title: it.title,
        sub: it.sub,
        icon: it.icon,
        anchor: it.anchor,
        tag: (it.tag ?? null) as TripDetail["days"][number]["items"][number]["tag"],
      })),
    })),
    expenses: expenses.map((e) => ({
      id: e.id,
      date: e.date,
      label: e.label,
      amountCents: e.amountCents,
      currency: e.currency,
      paidById: e.paidById,
    })),
    packing: packing.map((p) => ({
      id: p.id,
      category: p.category,
      label: p.label,
      done: p.done,
      position: p.position,
    })),
    docs: docs.map((d) => ({
      id: d.id,
      ownerId: d.ownerId,
      label: d.label,
      kind: d.kind,
      size: d.size,
      url: d.url ?? null,
    })),
  };

  return c.json(detail);
});

tripsRouter.delete("/:id", async (c) => {
  const session = c.get("session");
  const tripId = c.req.param("id");
  if (!tripId) return c.json({ error: "not_found" }, 404);

  const [tripRow] = await db.select().from(schema.trip).where(eq(schema.trip.id, tripId));
  if (!tripRow) return c.json({ error: "not_found" }, 404);
  if (tripRow.ownerId !== session.user.id) return c.json({ error: "forbidden" }, 403);

  await db.delete(schema.trip).where(eq(schema.trip.id, tripId));
  return c.json({ ok: true });
});
