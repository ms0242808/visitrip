"use client";

import { useState } from "react";
import type { Trip } from "@/lib/types";
import { coverGradient } from "@/lib/types";
import { dayCount, formatRange } from "@/lib/dates";
import { CalendarIcon, CompassIcon, MapPinIcon } from "./Icons";
import StatPill from "./StatPill";
import BudgetRing from "./BudgetRing";
import TripCustomizeSheet from "./TripCustomizeSheet";

interface Props {
  trip: Trip;
  onUpdate: (patch: Partial<Trip>) => void;
  readOnly?: boolean;
}

export default function TripHeader({ trip, onUpdate, readOnly = false }: Props) {
  const [editingDates, setEditingDates] = useState(false);
  const [customizing, setCustomizing] = useState(false);

  const days = dayCount(trip.startDate, trip.endDate);
  const spent = trip.activities.reduce((sum, a) => sum + (a.cost || 0), 0);
  const budget = trip.budget ?? 0;

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
      <div className="relative mx-auto flex max-w-5xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
        {/* destination tag */}
        <div className="flex items-center gap-2 text-sm font-semibold text-brand-strong">
          {readOnly ? (
            <span className="text-lg leading-none">{trip.emoji}</span>
          ) : (
            <button
              onClick={() => setCustomizing(true)}
              className="rounded-lg text-lg leading-none transition-transform hover:scale-110 active:scale-95"
              aria-label="Customise trip cover and icon"
              title="Customise cover & icon"
            >
              {trip.emoji}
            </button>
          )}
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
        </div>
        </div>

        {/* budget ring */}
        <div className="flex shrink-0 flex-col items-center gap-2.5 self-center sm:self-end">
          <BudgetRing spent={spent} budget={budget} currency={trip.currency} />
          {!readOnly && (
            <label className="flex items-center gap-2 text-xs font-medium text-text-faint">
              <span>Budget {trip.currency}</span>
              <input
                type="number"
                min={0}
                className="field !w-24 !py-1 text-sm"
                placeholder="Set"
                value={trip.budget ?? ""}
                onChange={(e) =>
                  onUpdate({ budget: e.target.value ? Number(e.target.value) : undefined })
                }
              />
            </label>
          )}
        </div>
      </div>

      {customizing && (
        <TripCustomizeSheet
          trip={trip}
          onUpdate={onUpdate}
          onClose={() => setCustomizing(false)}
        />
      )}
    </header>
  );
}
