import type { Trip } from "./types";
import { dayCount, fromISODate, toISODate } from "./dates";

export type TripStatus = "ongoing" | "upcoming" | "past" | "draft";

export interface TripStats {
  days: number;
  plans: number;
  spent: number;
  status: TripStatus;
  /** whole days until start (negative if started); null when no dates */
  countdown: number | null;
}

export function tripStats(trip: Trip): TripStats {
  const days = dayCount(trip.startDate, trip.endDate);
  const plans = trip.activities.length;
  const spent = trip.activities.reduce((s, a) => s + (a.cost || 0), 0);

  let status: TripStatus = "draft";
  let countdown: number | null = null;

  if (trip.startDate && trip.endDate) {
    const today = toISODate(new Date());
    if (today < trip.startDate) status = "upcoming";
    else if (today > trip.endDate) status = "past";
    else status = "ongoing";

    const ms = fromISODate(trip.startDate).getTime() - fromISODate(today).getTime();
    countdown = Math.round(ms / 86_400_000);
  }

  return { days, plans, spent, status, countdown };
}

export function countdownLabel(stats: TripStats): string {
  if (stats.status === "ongoing") return "Happening now";
  if (stats.status === "past") return "Completed";
  if (stats.countdown == null) return "No dates yet";
  if (stats.countdown === 0) return "Starts today";
  if (stats.countdown === 1) return "Tomorrow";
  return `In ${stats.countdown} days`;
}
