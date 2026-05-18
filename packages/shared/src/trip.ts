import { z } from "zod";

export const coverKindSchema = z.enum(["cover-lisbon", "cover-hokkaido", "cover-cdmx"]);
export type CoverKind = z.infer<typeof coverKindSchema>;

export const roleSchema = z.enum(["owner", "editor", "viewer"]);
export type Role = z.infer<typeof roleSchema>;

export const memberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: roleSchema,
});
export type Member = z.infer<typeof memberSchema>;

export const dayItemKindSchema = z.enum(["flight", "stay", "place", "food", "transit"]);
export type DayItemKind = z.infer<typeof dayItemKindSchema>;

export const dayItemTagSchema = z.enum(["Reservation", "Tickets", "Booked", "Walk-in"]);

export const dayItemSchema = z.object({
  id: z.string(),
  position: z.number().int(),
  type: dayItemKindSchema,
  time: z.string(),
  title: z.string(),
  sub: z.string(),
  icon: z.string(),
  anchor: z.boolean(),
  tag: dayItemTagSchema.nullable(),
});
export type DayItem = z.infer<typeof dayItemSchema>;

export const daySchema = z.object({
  id: z.string(),
  position: z.number().int(),
  date: z.string(),
  label: z.string(),
  items: z.array(dayItemSchema),
});
export type Day = z.infer<typeof daySchema>;

export const expenseSchema = z.object({
  id: z.string(),
  date: z.string(),
  label: z.string(),
  amountCents: z.number().int(),
  currency: z.string(),
  paidById: z.string(),
});
export type Expense = z.infer<typeof expenseSchema>;

export const packingItemSchema = z.object({
  id: z.string(),
  category: z.string(),
  label: z.string(),
  done: z.boolean(),
  position: z.number().int(),
});
export type PackingItem = z.infer<typeof packingItemSchema>;

export const docSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  label: z.string(),
  kind: z.string(),
  size: z.string(),
  url: z.string().nullable(),
});
export type Doc = z.infer<typeof docSchema>;

export const tripSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  location: z.string(),
  cover: coverKindSchema,
  startDate: z.string(),
  endDate: z.string(),
  archived: z.boolean(),
  memberCount: z.number().int(),
});
export type TripSummary = z.infer<typeof tripSummarySchema>;

export const tripDetailSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  title: z.string(),
  location: z.string(),
  cover: coverKindSchema,
  startDate: z.string(),
  endDate: z.string(),
  summary: z.string(),
  currency: z.string(),
  budgetTotalCents: z.number().int(),
  archived: z.boolean(),
  members: z.array(memberSchema),
  days: z.array(daySchema),
  expenses: z.array(expenseSchema),
  packing: z.array(packingItemSchema),
  docs: z.array(docSchema),
});
export type TripDetail = z.infer<typeof tripDetailSchema>;

export const createTripSchema = z.object({
  title: z.string().min(1).max(120),
  location: z.string().min(1).max(120),
  cover: coverKindSchema,
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  summary: z.string().max(2000).optional(),
});
export type CreateTripInput = z.infer<typeof createTripSchema>;

export const updateTripSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  location: z.string().min(1).max(120).optional(),
  cover: coverKindSchema.optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  summary: z.string().max(2000).optional(),
  currency: z.string().length(3).optional(),
  budgetTotalCents: z.number().int().min(0).optional(),
  archived: z.boolean().optional(),
});
export type UpdateTripInput = z.infer<typeof updateTripSchema>;

export const createDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  label: z.string().min(1).max(120),
});
export type CreateDayInput = z.infer<typeof createDaySchema>;

export const updateDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  label: z.string().min(1).max(120).optional(),
  position: z.number().int().min(0).optional(),
});
export type UpdateDayInput = z.infer<typeof updateDaySchema>;

export const createDayItemSchema = z.object({
  type: dayItemKindSchema,
  time: z.string().min(1).max(20),
  title: z.string().min(1).max(160),
  sub: z.string().max(240).optional(),
  icon: z.string().max(32).optional(),
  anchor: z.boolean().optional(),
  tag: dayItemTagSchema.nullable().optional(),
});
export type CreateDayItemInput = z.infer<typeof createDayItemSchema>;

export const updateDayItemSchema = createDayItemSchema.partial().extend({
  position: z.number().int().min(0).optional(),
});
export type UpdateDayItemInput = z.infer<typeof updateDayItemSchema>;

export const reorderSchema = z.object({
  ids: z.array(z.string()).min(1),
});
export type ReorderInput = z.infer<typeof reorderSchema>;

export const createExpenseSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  label: z.string().min(1).max(160),
  amountCents: z.number().int().min(0),
  currency: z.string().length(3).optional(),
  paidById: z.string().optional(),
});
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export const listTripsResponseSchema = z.object({
  trips: z.array(tripSummarySchema),
});
export type ListTripsResponse = z.infer<typeof listTripsResponseSchema>;
