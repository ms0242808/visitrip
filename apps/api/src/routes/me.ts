import { Hono } from "hono";
import { asc, eq, inArray } from "drizzle-orm";
import { schema } from "@visitrip/db";
import { db } from "../db";
import { requireAuth, type Variables } from "../middleware";

export const meRouter = new Hono<{ Variables: Variables }>();

meRouter.use("*", requireAuth);

meRouter.get("/export", async (c) => {
  const session = c.get("session");
  const userId = session.user.id;

  const memberships = await db
    .select({ tripId: schema.tripMember.tripId, role: schema.tripMember.role })
    .from(schema.tripMember)
    .where(eq(schema.tripMember.userId, userId));

  const tripIds = memberships.map((m) => m.tripId);

  const [trips, days, items, expenses, packing] = tripIds.length
    ? await Promise.all([
        db.select().from(schema.trip).where(inArray(schema.trip.id, tripIds)),
        db
          .select()
          .from(schema.day)
          .where(inArray(schema.day.tripId, tripIds))
          .orderBy(asc(schema.day.tripId), asc(schema.day.position)),
        db
          .select()
          .from(schema.dayItem)
          .where(inArray(schema.dayItem.dayId, [])),
        db.select().from(schema.expense).where(inArray(schema.expense.tripId, tripIds)),
        db.select().from(schema.packingItem).where(inArray(schema.packingItem.tripId, tripIds)),
      ])
    : [[], [], [], [], []];

  // Day items require day IDs; fetch in a second pass once we have days.
  const dayIds = (days as Array<{ id: string }>).map((d) => d.id);
  const dayItems = dayIds.length
    ? await db
        .select()
        .from(schema.dayItem)
        .where(inArray(schema.dayItem.dayId, dayIds))
        .orderBy(asc(schema.dayItem.dayId), asc(schema.dayItem.position))
    : items;

  return c.json({
    exportedAt: new Date().toISOString(),
    schema: "visitrip.v1",
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    },
    trips,
    memberships,
    days,
    dayItems,
    expenses,
    packing,
  });
});
