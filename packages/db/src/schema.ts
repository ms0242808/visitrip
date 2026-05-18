import { sql } from "drizzle-orm";
import { boolean, integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

const ts = (name: string) =>
  timestamp(name, { withTimezone: true, mode: "date" }).notNull().default(sql`now()`);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
});

export const account = pgTable("account", {
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
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true, mode: "date" }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true, mode: "date" }),
  scope: text("scope"),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
});

export const trip = pgTable("trip", {
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
  archived: boolean("archived").notNull().default(false),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
});

export const tripMember = pgTable(
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

export const day = pgTable("day", {
  id: text("id").primaryKey(),
  tripId: text("trip_id")
    .notNull()
    .references(() => trip.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  date: text("date").notNull(),
  label: text("label").notNull(),
});

export const dayItem = pgTable("day_item", {
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
  anchor: boolean("anchor").notNull().default(false),
  tag: text("tag"),
});

export const expense = pgTable("expense", {
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

export const packingItem = pgTable("packing_item", {
  id: text("id").primaryKey(),
  tripId: text("trip_id")
    .notNull()
    .references(() => trip.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  label: text("label").notNull(),
  done: boolean("done").notNull().default(false),
  position: integer("position").notNull().default(0),
});

export const tripDoc = pgTable("trip_doc", {
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
