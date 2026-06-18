"use client";

import { useEffect, useMemo, useState } from "react";
import type { Activity } from "@/lib/types";
import { dateRange, formatDay } from "@/lib/dates";
import { useTrip } from "@/lib/useTrip";
import { buildBlankTrip, buildSampleTrip } from "@/lib/sample";
import Landing from "./Landing";
import TripHeader from "./TripHeader";
import DayRail from "./DayRail";
import DayTimeline from "./DayTimeline";
import ActivitySheet, { type SheetState } from "./ActivitySheet";
import ThemeToggle from "./ThemeToggle";
import { PlaneIcon, PlusIcon } from "./Icons";

export default function TripPlanner() {
  const store = useTrip();
  const { trip, hydrated } = store;

  const [selectedDay, setSelectedDay] = useState<string>("");
  const [sheet, setSheet] = useState<SheetState | null>(null);

  const days = useMemo(
    () => (trip ? dateRange(trip.startDate, trip.endDate) : []),
    [trip],
  );

  // keep the selected day valid as dates change
  useEffect(() => {
    if (days.length === 0) return;
    if (!days.includes(selectedDay)) setSelectedDay(days[0]);
  }, [days, selectedDay]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    trip?.activities.forEach((a) => {
      map[a.date] = (map[a.date] ?? 0) + 1;
    });
    return map;
  }, [trip]);

  const dayActivities = useMemo(
    () => trip?.activities.filter((a) => a.date === selectedDay) ?? [],
    [trip, selectedDay],
  );

  // --- loading state (avoids hydration flash) ---
  if (!hydrated) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <div className="flex items-center gap-2 text-brand">
          <PlaneIcon className="animate-pulse" />
          <span className="font-display text-lg font-bold">Visitrip</span>
        </div>
      </div>
    );
  }

  // --- onboarding ---
  if (!trip) {
    return (
      <main className="min-h-[100dvh]">
        <TopBar onReset={null} />
        <Landing
          onCreate={(name, destination) => {
            const t = buildBlankTrip();
            store.setTrip({ ...t, name, destination });
          }}
          onLoadSample={() => store.setTrip(buildSampleTrip())}
        />
      </main>
    );
  }

  const selectedLabel = (() => {
    const idx = days.indexOf(selectedDay);
    const { weekday, day, month } = formatDay(selectedDay || days[0] || "");
    return `Day ${idx + 1} · ${weekday}, ${month} ${day}`;
  })();

  const saveActivity = (data: Omit<Activity, "id">, id?: string) => {
    if (id) store.updateActivity(id, data);
    else store.addActivity(data);
    setSheet(null);
  };

  return (
    <main className="min-h-[100dvh] pb-28 sm:pb-12">
      <TopBar
        onReset={() => {
          if (confirm("Start a new trip? Your current plan will be cleared.")) {
            store.reset();
          }
        }}
      />

      <TripHeader trip={trip} onUpdate={store.updateTrip} />

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
          onDelete={store.removeActivity}
          onToggleDone={store.toggleDone}
        />
      </div>

      {/* floating add button (mobile) */}
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
          onClose={() => setSheet(null)}
          onSave={saveActivity}
        />
      )}
    </main>
  );
}

function TopBar({ onReset }: { onReset: (() => void) | null }) {
  return (
    <div className="sticky top-0 z-40 border-b border-border/60 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3 sm:px-8">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-white">
            <PlaneIcon width={18} height={18} />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight">
            Visi<span className="text-brand">trip</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onReset && (
            <button onClick={onReset} className="btn btn-ghost px-3 py-2 text-sm">
              New trip
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
