"use client";

import { formatDay } from "@/lib/dates";

interface Props {
  days: string[];
  selected: string;
  counts: Record<string, number>;
  onSelect: (iso: string) => void;
}

export default function DayRail({ days, selected, counts, onSelect }: Props) {
  return (
    <div className="no-scrollbar -mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
      {days.map((iso, i) => {
        const { weekday, day, month } = formatDay(iso);
        const isActive = iso === selected;
        const count = counts[iso] ?? 0;
        return (
          <button
            key={iso}
            onClick={() => onSelect(iso)}
            className={[
              "group relative flex shrink-0 flex-col items-center rounded-2xl border px-4 py-2.5 transition-all duration-200",
              isActive
                ? "border-transparent bg-brand text-white shadow-[0_12px_24px_-10px_var(--brand)]"
                : "border-border bg-surface text-text-soft hover:-translate-y-0.5 hover:border-brand/40 hover:text-text",
            ].join(" ")}
          >
            <span
              className={[
                "text-[10px] font-bold uppercase tracking-wider",
                isActive ? "text-white/80" : "text-text-faint",
              ].join(" ")}
            >
              Day {i + 1}
            </span>
            <span className="text-lg font-bold leading-none">{day}</span>
            <span
              className={[
                "text-[11px] font-medium",
                isActive ? "text-white/80" : "text-text-faint",
              ].join(" ")}
            >
              {weekday} {month}
            </span>
            {count > 0 && (
              <span
                className={[
                  "absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                  isActive ? "bg-white text-brand" : "bg-brand-soft text-brand-strong",
                ].join(" ")}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
