"use client";

import type { Activity } from "@/lib/types";
import { CATEGORY_MAP } from "@/lib/types";
import { formatDay, prettyTime } from "@/lib/dates";

interface Props {
  days: string[];
  activities: Activity[];
  currency: string;
  readOnly?: boolean;
  onJumpToDay: (date: string) => void;
  onEdit: (a: Activity) => void;
}

function sortDay(list: Activity[]): Activity[] {
  return [...list].sort((a, b) => {
    if (a.time && b.time) return a.time.localeCompare(b.time);
    if (a.time) return -1;
    if (b.time) return 1;
    return 0;
  });
}

export default function TripOverview({
  days,
  activities,
  currency,
  readOnly = false,
  onJumpToDay,
  onEdit,
}: Props) {
  return (
    <section className="mt-6 flex flex-col gap-5 pb-4">
      {days.map((date, i) => {
        const dayPlans = sortDay(activities.filter((a) => a.date === date));
        const total = dayPlans.reduce((s, a) => s + (a.cost || 0), 0);
        const f = formatDay(date);

        return (
          <div
            key={date}
            className="card overflow-hidden p-0"
            style={{ animation: "var(--animate-fade-up)", animationDelay: `${i * 50}ms` }}
          >
            {/* day header — tap to jump into that day */}
            <button
              onClick={() => onJumpToDay(date)}
              className="flex w-full items-center justify-between gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-surface-2"
            >
              <div className="flex items-baseline gap-2">
                <span className="font-display text-base font-bold">Day {i + 1}</span>
                <span className="text-sm text-text-soft">
                  {f.weekday}, {f.month} {f.day}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-faint">
                <span>
                  {dayPlans.length} {dayPlans.length === 1 ? "plan" : "plans"}
                  {total > 0 && (
                    <span className="ml-1 font-semibold text-text-soft">
                      · {currency}
                      {total.toLocaleString()}
                    </span>
                  )}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </button>

            {dayPlans.length === 0 ? (
              <p className="px-4 py-4 text-sm text-text-faint">Nothing planned yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {dayPlans.map((a) => {
                  const cat = CATEGORY_MAP[a.category];
                  return (
                    <li key={a.id}>
                      <button
                        onClick={() => !readOnly && onEdit(a)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          readOnly ? "cursor-default" : "hover:bg-surface-2"
                        }`}
                      >
                        {/* time */}
                        <span className="w-16 shrink-0 text-xs font-semibold tabular-nums text-text-soft">
                          {a.time ? prettyTime(a.time) : "—"}
                        </span>
                        {/* category dot */}
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: `var(${cat.colorVar})` }}
                          aria-hidden
                        />
                        {/* title + location */}
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block truncate text-sm font-medium ${
                              a.done ? "text-text-faint line-through" : ""
                            }`}
                          >
                            {a.title}
                          </span>
                          {a.location && (
                            <span className="block truncate text-xs text-text-faint">
                              {a.location}
                            </span>
                          )}
                        </span>
                        {/* cost */}
                        {a.cost != null && a.cost > 0 && (
                          <span className="shrink-0 text-xs font-semibold tabular-nums text-text-soft">
                            {currency}
                            {a.cost.toLocaleString()}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </section>
  );
}
