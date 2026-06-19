"use client";

import { useEffect, useMemo, useState } from "react";
import type { Activity, Trip } from "@/lib/types";
import { dateRange, formatDay } from "@/lib/dates";
import TopBar from "./TopBar";
import TripHeader from "./TripHeader";
import DayRail from "./DayRail";
import DayTimeline from "./DayTimeline";
import ActivitySheet, { type SheetState } from "./ActivitySheet";
import { PlusIcon } from "./Icons";

interface Props {
  trip: Trip;
  onBack: () => void;
  onUpdateTrip: (patch: Partial<Trip>) => void;
  onAddActivity: (a: Omit<Activity, "id">) => void;
  onUpdateActivity: (id: string, patch: Partial<Activity>) => void;
  onRemoveActivity: (id: string) => void;
  onToggleDone: (id: string) => void;
}

export default function PlannerView({
  trip,
  onBack,
  onUpdateTrip,
  onAddActivity,
  onUpdateActivity,
  onRemoveActivity,
  onToggleDone,
}: Props) {
  const [selectedDay, setSelectedDay] = useState("");
  const [sheet, setSheet] = useState<SheetState | null>(null);

  const days = useMemo(() => dateRange(trip.startDate, trip.endDate), [trip.startDate, trip.endDate]);

  useEffect(() => {
    if (days.length === 0) return;
    if (!days.includes(selectedDay)) setSelectedDay(days[0]);
  }, [days, selectedDay]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    trip.activities.forEach((a) => {
      map[a.date] = (map[a.date] ?? 0) + 1;
    });
    return map;
  }, [trip.activities]);

  const dayActivities = useMemo(
    () => trip.activities.filter((a) => a.date === selectedDay),
    [trip.activities, selectedDay],
  );

  const selectedLabel = (() => {
    const idx = days.indexOf(selectedDay);
    const { weekday, day, month } = formatDay(selectedDay || days[0] || "");
    return `Day ${idx + 1} · ${weekday}, ${month} ${day}`;
  })();

  const saveActivity = (data: Omit<Activity, "id">, id?: string) => {
    if (id) onUpdateActivity(id, data);
    else onAddActivity(data);
    // follow the plan to whichever day it landed on
    if (data.date !== selectedDay) setSelectedDay(data.date);
    setSheet(null);
  };

  return (
    <main className="min-h-[100dvh] pb-28 sm:pb-12">
      <TopBar
        onLogoClick={onBack}
        left={
          <button
            onClick={onBack}
            className="btn btn-ghost h-9 px-2.5 text-sm"
            aria-label="Back to all trips"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className="hidden sm:inline">Trips</span>
          </button>
        }
      />

      <TripHeader trip={trip} onUpdate={onUpdateTrip} />

      <div className="mx-auto max-w-5xl px-5 pt-6 sm:px-8">
        <DayRail
          days={days}
          selected={selectedDay || days[0] || ""}
          counts={counts}
          onSelect={setSelectedDay}
        />

        <DayTimeline
          key={selectedDay}
          activities={dayActivities}
          currency={trip.currency}
          dayLabel={selectedLabel}
          onAdd={() => setSheet({ date: selectedDay || days[0] })}
          onEdit={(a) => setSheet({ date: a.date, activity: a })}
          onDelete={onRemoveActivity}
          onToggleDone={onToggleDone}
        />
      </div>

      <button
        onClick={() => setSheet({ date: selectedDay || days[0] })}
        className="btn btn-primary fixed bottom-5 right-5 z-30 h-14 w-14 !p-0 shadow-[var(--shadow-lg)] sm:hidden"
        aria-label="Add plan"
      >
        <PlusIcon width={24} height={24} />
      </button>

      {sheet && (
        <ActivitySheet
          state={sheet}
          currency={trip.currency}
          days={days}
          onClose={() => setSheet(null)}
          onSave={saveActivity}
        />
      )}
    </main>
  );
}
