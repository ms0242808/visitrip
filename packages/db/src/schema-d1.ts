import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

const ts = (name: string) =>
  integer(name, { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date());

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  password: text("password"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp_ms" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp_ms" }),
  scope: text("scope"),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
});

export const trip = sqliteTable("trip", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  location: text("location").notNull().default(""),
  cover: text("cover").notNull().default("cover-lisbon"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  summary: text("summary").notNull().default(""),
  currency: text("currency").notNull().default("USD"),
  budgetTotalCents: integer("budget_total_cents").notNull().default(0),
  archived: integer("archived", { mode: "boolean" }).notNull().default(false),
  isPrivate: integer("is_private", { mode: "boolean" }).notNull().default(true),
  vibes: text("vibes", { mode: "json" }).$type<string[]>().notNull().default([]),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
});

export const tripMember = sqliteTable(
  "trip_member",
  {
    tripId: text("trip_id")
      .notNull()
      .references(() => trip.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("editor"),
    joinedAt: ts("joined_at"),
  },
  (t) => ({ pk: primaryKey({ columns: [t.tripId, t.userId] }) }),
);

export const day = sqliteTable("day", {
  id: text("id").primaryKey(),
  tripId: text("trip_id")
    .notNull()
    .references(() => trip.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  date: text("date").notNull(),
  label: text("label").notNull(),
});

export const dayItem = sqliteTable("day_item", {
  id: text("id").primaryKey(),
  dayId: text("day_id")
    .notNull()
    .references(() => day.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  type: text("type").notNull(),
  time: text("time").notNull(),
  title: text("title").notNull(),
  sub: text("sub").notNull().default(""),
  icon: text("icon").notNull().default("pin"),
  anchor: integer("anchor", { mode: "boolean" }).notNull().default(false),
  tag: text("tag"),
});

export const expense = sqliteTable("expense", {
  id: text("id").primaryKey(),
  tripId: text("trip_id")
    .notNull()
    .references(() => trip.id, { onDelete: "cascade" }),
  paidById: text("paid_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  label: text("label").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull(),
  createdAt: ts("created_at"),
});

export const packingItem = sqliteTable("packing_item", {
  id: text("id").primaryKey(),
  tripId: text("trip_id")
    .notNull()
    .references(() => trip.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  label: text("label").notNull(),
  done: integer("done", { mode: "boolean" }).notNull().default(false),
  position: integer("position").notNull().default(0),
});

export const tripInvite = sqliteTable("trip_invite", {
  id: text("id").primaryKey(),
  tripId: text("trip_id")
    .notNull()
    .references(() => trip.id, { onDelete: "cascade" }),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  role: text("role").notNull().default("editor"),
  revoked: integer("revoked", { mode: "boolean" }).notNull().default(false),
  createdAt: ts("created_at"),
});

// trip_yjs_state is omitted on D1 — the per-trip Durable Object owns the Yjs snapshot in its own storage.

export const tripDoc = sqliteTable("trip_doc", {
  id: text("id").primaryKey(),
  tripId: text("trip_id")
    .notNull()
    .references(() => trip.id, { onDelete: "cascade" }),
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  kind: text("kind").notNull(),
  size: text("size").notNull(),
  url: text("url"),
  createdAt: ts("created_at"),
});
