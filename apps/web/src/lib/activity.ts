import { useCallback, useEffect, useState } from "react";
import type { ActivityEvent } from "@visitrip/shared";
import { api } from "./api";

interface UseActivityOptions {
  tripId?: string;
  limit?: number;
  refreshKey?: number;
}

interface UseActivityResult {
  events: ActivityEvent[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useActivity(opts: UseActivityOptions = {}): UseActivityResult {
  const { tripId, limit, refreshKey = 0 } = opts;
  const [events, setEvents] = useState<ActivityEvent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listActivity({ tripId, limit });
      setEvents(data.events);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load activity");
    } finally {
      setLoading(false);
    }
  }, [tripId, limit]);

  useEffect(() => {
    void refresh();
  }, [refresh, refreshKey]);

  return { events, loading, error, refresh };
}

const NUMBER_FMT = (n: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);

export function summarizeActivity(event: ActivityEvent): string {
  switch (event.kind) {
    case "trip_created":
      return `started this trip`;
    case "member_joined":
      return `joined the trip`;
    case "expense_added": {
      const label = String(event.payload?.label ?? "an expense");
      const cents = Number(event.payload?.amountCents ?? 0);
      const currency = String(event.payload?.currency ?? "");
      const formatted = NUMBER_FMT(cents / 100);
      return `paid ${currency}${formatted} for ${label}`;
    }
    case "invite_created":
      return `created an invite link`;
    case "doc_added": {
      const label = String(event.payload?.label ?? "a document");
      return `added ${label}`;
    }
    default:
      return "did something";
  }
}

export function activityIconFor(kind: ActivityEvent["kind"]):
  | "sparkle"
  | "user_plus"
  | "cash"
  | "share"
  | "doc" {
  switch (kind) {
    case "trip_created":
      return "sparkle";
    case "member_joined":
      return "user_plus";
    case "expense_added":
      return "cash";
    case "invite_created":
      return "share";
    case "doc_added":
      return "doc";
  }
}

export function relativeTime(iso: string): string {
  const ms = new Date(iso).getTime();
  if (!Number.isFinite(ms)) return "";
  const diff = Date.now() - ms;
  const s = Math.max(0, Math.round(diff / 1000));
  if (s < 60) return s <= 5 ? "just now" : `${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(ms).toLocaleDateString();
}

export function bucketEvents(events: ActivityEvent[]): Record<string, ActivityEvent[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(today);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const earlierStart = new Date(today);
  earlierStart.setDate(earlierStart.getDate() - 7);

  const buckets: Record<string, ActivityEvent[]> = {
    Today: [],
    Yesterday: [],
    "Earlier this week": [],
    Older: [],
  };

  for (const e of events) {
    const t = new Date(e.createdAt);
    if (t >= today) buckets.Today!.push(e);
    else if (t >= yesterdayStart) buckets.Yesterday!.push(e);
    else if (t >= earlierStart) buckets["Earlier this week"]!.push(e);
    else buckets.Older!.push(e);
  }

  return buckets;
}
