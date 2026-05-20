import { z } from "zod";
import { coverKindSchema } from "./trip.ts";

export const activityKindSchema = z.enum([
  "trip_created",
  "member_joined",
  "expense_added",
  "invite_created",
  "doc_added",
]);
export type ActivityKind = z.infer<typeof activityKindSchema>;

export const activityEventSchema = z.object({
  id: z.string(),
  kind: activityKindSchema,
  tripId: z.string(),
  tripTitle: z.string(),
  tripCover: coverKindSchema,
  actorId: z.string(),
  actorName: z.string(),
  createdAt: z.string(), // ISO timestamp
  payload: z.record(z.string(), z.unknown()).optional(),
});
export type ActivityEvent = z.infer<typeof activityEventSchema>;

export const listActivityResponseSchema = z.object({
  events: z.array(activityEventSchema),
});
export type ListActivityResponse = z.infer<typeof listActivityResponseSchema>;
