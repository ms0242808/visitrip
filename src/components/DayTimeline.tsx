"use client";

import type { Activity } from "@/lib/types";
import ActivityCard from "./ActivityCard";
import { CompassIcon, PlusIcon } from "./Icons";

interface Props {
  activities: Activity[];
  currency: string;
  dayLabel: string;
  readOnly?: boolean;
  onAdd: () => void;
  onEdit: (a: Activity) => void;
  onDelete: (id: string) => void;
  onToggleDone: (id: string) => void;
}

export default function DayTimeline({
  activities,
  currency,
  dayLabel,
  readOnly = false,
  onAdd,
  onEdit,
  onDelete,
  onToggleDone,
}: Props) {
  // sort: timed first (chronological), then untimed
  const sorted = [...activities].sort((a, b) => {
    if (a.time && b.time) return a.time.localeCompare(b.time);
    if (a.time) return -1;
    if (b.time) return 1;
    return 0;
  });

  const dayTotal = sorted.reduce((s, a) => s + (a.cost || 0), 0);

  return (
    <section className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold">{dayLabel}</h2>
          <p className="text-sm text-text-faint">
            {sorted.length} {sorted.length === 1 ? "plan" : "plans"}
            {dayTotal > 0 && (
              <>
                {" · "}
                <span className="font-medium text-text-soft">
                  {currency}
                  {dayTotal.toLocaleString()}
                </span>
              </>
            )}
          </p>
        </div>
        {!readOnly && (
          <button onClick={onAdd} className="btn btn-primary px-4 py-2 text-sm">
            <PlusIcon width={17} height={17} /> Add plan
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
            <CompassIcon />
          </div>
          <div>
            <p className="font-semibold">
              {readOnly ? "Nothing planned this day" : "This day is a blank canvas"}
            </p>
            {!readOnly && (
              <p className="mx-auto mt-1 max-w-xs text-sm text-text-soft">
                Add your first plan — a sight to see, a meal to eat, a train to catch.
              </p>
            )}
          </div>
          {!readOnly && (
            <button onClick={onAdd} className="btn btn-outline mt-1 px-4 py-2 text-sm">
              <PlusIcon width={16} height={16} /> Add the first plan
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          {/* timeline spine */}
          <span
            className="absolute left-[14px] top-2 bottom-6 w-0.5 origin-top bg-gradient-to-b from-brand/40 via-border to-transparent sm:left-[22px]"
            style={{ animation: "draw-line 0.6s ease both" }}
            aria-hidden
          />
          <ul className="flex flex-col gap-3">
            {sorted.map((a, i) => (
              <ActivityCard
                key={a.id}
                activity={a}
                currency={currency}
                index={i}
                readOnly={readOnly}
                onEdit={() => onEdit(a)}
                onDelete={() => onDelete(a.id)}
                onToggleDone={() => onToggleDone(a.id)}
              />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
