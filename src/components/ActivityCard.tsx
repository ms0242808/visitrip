"use client";

import type { Activity } from "@/lib/types";
import { CATEGORY_MAP } from "@/lib/types";
import { prettyTime } from "@/lib/dates";
import { CheckIcon, EditIcon, MapPinIcon, TrashIcon } from "./Icons";

interface Props {
  activity: Activity;
  currency: string;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggleDone: () => void;
}

export default function ActivityCard({
  activity,
  currency,
  index,
  onEdit,
  onDelete,
  onToggleDone,
}: Props) {
  const cat = CATEGORY_MAP[activity.category];
  const color = `var(${cat.colorVar})`;

  return (
    <li
      className="group relative pl-12 sm:pl-16"
      style={{ animation: "var(--animate-fade-up)", animationDelay: `${index * 55}ms` }}
    >
      {/* timeline node */}
      <span
        className="absolute left-[14px] top-5 z-10 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-[3px] border-bg text-sm sm:left-[22px]"
        style={{ background: color }}
        aria-hidden
      >
        <span className="text-[11px]">{cat.emoji}</span>
      </span>

      <article
        className={[
          "card relative overflow-hidden p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
          activity.done ? "opacity-60" : "",
        ].join(" ")}
      >
        {/* colour spine */}
        <span
          className="absolute inset-y-0 left-0 w-1.5"
          style={{ background: color }}
          aria-hidden
        />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {activity.time && (
                <span className="text-xs font-bold tabular-nums text-text-soft">
                  {prettyTime(activity.time)}
                </span>
              )}
              <span
                className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}
              >
                {cat.label}
              </span>
            </div>
            <h4
              className={[
                "mt-1 truncate font-semibold leading-snug",
                activity.done ? "line-through" : "",
              ].join(" ")}
            >
              {activity.title}
            </h4>
            {activity.location && (
              <p className="mt-0.5 flex items-center gap-1 text-sm text-text-soft">
                <MapPinIcon width={13} height={13} className="shrink-0" />
                <span className="truncate">{activity.location}</span>
              </p>
            )}
            {activity.notes && (
              <p className="mt-1.5 text-sm text-text-faint">{activity.notes}</p>
            )}
          </div>

          {typeof activity.cost === "number" && activity.cost > 0 && (
            <span className="shrink-0 rounded-xl bg-surface-2 px-2.5 py-1 text-sm font-bold tabular-nums">
              {currency}
              {activity.cost.toLocaleString()}
            </span>
          )}
        </div>

        {/* hover action bar */}
        <div className="mt-3 flex items-center gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
          <button
            onClick={onToggleDone}
            className="btn btn-ghost px-2.5 py-1.5 text-xs"
            aria-label={activity.done ? "Mark as not done" : "Mark as done"}
          >
            <CheckIcon width={15} height={15} />
            {activity.done ? "Undo" : "Done"}
          </button>
          <button
            onClick={onEdit}
            className="btn btn-ghost px-2.5 py-1.5 text-xs"
            aria-label="Edit activity"
          >
            <EditIcon width={15} height={15} /> Edit
          </button>
          <button
            onClick={onDelete}
            className="btn btn-ghost ml-auto px-2.5 py-1.5 text-xs !text-lodging hover:!bg-lodging/10"
            aria-label="Delete activity"
          >
            <TrashIcon width={15} height={15} />
          </button>
        </div>
      </article>
    </li>
  );
}
