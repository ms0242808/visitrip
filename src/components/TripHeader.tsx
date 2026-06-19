"use client";

import { useState } from "react";
import type { Trip } from "@/lib/types";
import { coverGradient } from "@/lib/types";
import { dayCount, formatRange } from "@/lib/dates";
import { CalendarIcon, CompassIcon, MapPinIcon, WalletIcon } from "./Icons";
import StatPill from "./StatPill";

interface Props {
  trip: Trip;
  onUpdate: (patch: Partial<Trip>) => void;
  readOnly?: boolean;
}

export default function TripHeader({ trip, onUpdate, readOnly = false }: Props) {
  const [editingDates, setEditingDates] = useState(false);

  const days = dayCount(trip.startDate, trip.endDate);
  const spent = trip.activities.reduce((sum, a) => sum + (a.cost || 0), 0);
  const budget = trip.budget ?? 0;
  const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const over = budget > 0 && spent > budget;

  return (
    <header className="relative overflow-hidden rounded-b-[2rem] border-b border-border bg-surface px-5 pt-6 pb-7 sm:rounded-b-[2.5rem] sm:px-8 sm:pt-8">
      {/* cover wash tied to the trip's identity */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-44 opacity-25"
        style={{ background: coverGradient(trip.cover) }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-transparent to-surface"
        aria-hidden
      />
      <div className="relative mx-auto max-w-5xl">
        {/* destination tag */}
        <div className="flex items-center gap-2 text-sm font-semibold text-brand-strong">
          <span className="text-lg leading-none">{trip.emoji}</span>
          <MapPinIcon width={16} height={16} />
          <input
            className="w-full max-w-[16rem] bg-transparent outline-none placeholder:text-brand-strong/50 focus:underline read-only:cursor-default"
            value={trip.destination}
            placeholder="Add a destination"
            readOnly={readOnly}
            onChange={(e) => onUpdate({ destination: e.target.value })}
          />
        </div>

        {/* trip name */}
        <input
          className="mt-1 w-full bg-transparent font-display text-3xl font-extrabold leading-tight tracking-tight outline-none placeholder:text-text-faint read-only:cursor-default sm:text-5xl"
          value={trip.name}
          placeholder="Name your trip"
          readOnly={readOnly}
          onChange={(e) => onUpdate({ name: e.target.value })}
        />

        {/* dates */}
        <div className="mt-2">
          {readOnly ? (
            <span className="inline-flex items-center gap-2 px-1 py-1 text-sm font-medium text-text-soft">
              <CalendarIcon width={16} height={16} />
              {formatRange(trip.startDate, trip.endDate)}
            </span>
          ) : editingDates ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <input
                type="date"
                className="field !w-auto !py-1.5"
                value={trip.startDate}
                max={trip.endDate}
                onChange={(e) => onUpdate({ startDate: e.target.value })}
              />
              <span className="text-text-faint">→</span>
              <input
                type="date"
                className="field !w-auto !py-1.5"
                value={trip.endDate}
                min={trip.startDate}
                onChange={(e) => onUpdate({ endDate: e.target.value })}
              />
              <button
                className="btn btn-primary px-3 py-1.5 text-sm"
                onClick={() => setEditingDates(false)}
              >
                Done
              </button>
            </div>
          ) : (
            <button
              className="inline-flex items-center gap-2 rounded-full px-1 py-1 text-sm font-medium text-text-soft transition-colors hover:text-brand"
              onClick={() => setEditingDates(true)}
            >
              <CalendarIcon width={16} height={16} />
              {formatRange(trip.startDate, trip.endDate)}
              <span className="text-text-faint">· edit</span>
            </button>
          )}
        </div>

        {/* stats */}
        <div className="mt-5 flex flex-wrap gap-3">
          <StatPill icon={<CalendarIcon width={18} height={18} />} label={days === 1 ? "day" : "days"} value={days} />
          <StatPill icon={<CompassIcon width={18} height={18} />} label="plans" value={trip.activities.length} />
          <StatPill
            icon={<WalletIcon width={18} height={18} />}
            label="estimated spend"
            value={spent}
            prefix={trip.currency}
          />
        </div>

        {/* budget bar */}
        <div className="mt-4 max-w-md">
          <div className="mb-1.5 flex items-center justify-between text-xs font-medium">
            <span className="text-text-faint">Budget</span>
            <span className={over ? "font-semibold text-lodging" : "text-text-soft"}>
              {trip.currency}
              {spent.toLocaleString()}{" "}
              <span className="text-text-faint">
                / {budget > 0 ? `${trip.currency}${budget.toLocaleString()}` : "set a budget"}
              </span>
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface/80">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: `${budget > 0 ? pct : 0}%`,
                background: over
                  ? "var(--c-lodging)"
                  : "linear-gradient(90deg, var(--accent), var(--brand))",
              }}
            />
          </div>
          <div className="mt-2 flex items-center gap-2">
            {!readOnly && (
              <>
                <span className="text-xs text-text-faint">Set budget:</span>
                <input
                  type="number"
                  min={0}
                  className="field !w-28 !py-1 text-sm"
                  placeholder="0"
                  value={trip.budget ?? ""}
                  onChange={(e) =>
                    onUpdate({ budget: e.target.value ? Number(e.target.value) : undefined })
                  }
                />
              </>
            )}
            {over && (
              <span className="text-xs font-semibold text-lodging">
                {trip.currency}
                {(spent - budget).toLocaleString()} over
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
