"use client";

import { useEffect, useMemo, useState } from "react";
import type { Activity, Collaborator, Trip } from "@/lib/types";
import { dateRange, formatDay, toISODate } from "@/lib/dates";
import TopBar from "./TopBar";
import TripHeader from "./TripHeader";
import DayRail from "./DayRail";
import DayTimeline from "./DayTimeline";
import ActivitySheet, { type SheetState } from "./ActivitySheet";
import ShareModal, { avatarColor, initials } from "./ShareModal";
import TripOverview from "./TripOverview";
import { PlusIcon } from "./Icons";

interface Props {
  trip: Trip;
  profileName: string;
  onChangeProfileName: (name: string) => void;
  onBack: () => void;
  onUpdateTrip: (patch: Partial<Trip>) => void;
  onAddActivity: (a: Omit<Activity, "id">) => void;
  onUpdateActivity: (id: string, patch: Partial<Activity>) => void;
  onRemoveActivity: (id: string) => void;
  onToggleDone: (id: string) => void;
  onAddCollaborator: (c: Omit<Collaborator, "id">) => void;
  onUpdateCollaborator: (id: string, patch: Partial<Collaborator>) => void;
  onRemoveCollaborator: (id: string) => void;
}

export default function PlannerView({
  trip,
  profileName,
  onChangeProfileName,
  onBack,
  onUpdateTrip,
  onAddActivity,
  onUpdateActivity,
  onRemoveActivity,
  onToggleDone,
  onAddCollaborator,
  onUpdateCollaborator,
  onRemoveCollaborator,
}: Props) {
  const [selectedDay, setSelectedDay] = useState("");
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [view, setView] = useState<"itinerary" | "overview">("itinerary");

  const readOnly = trip.role === "viewer";
  const days = useMemo(() => dateRange(trip.startDate, trip.endDate), [trip.startDate, trip.endDate]);

  useEffect(() => {
    if (days.length === 0) return;
    if (!days.includes(selectedDay)) {
      // during the trip, open straight to today; otherwise the first day
      const today = toISODate(new Date());
      setSelectedDay(days.includes(today) ? today : days[0]);
    }
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
    const iso = selectedDay || days[0] || "";
    const idx = days.indexOf(selectedDay);
    const { weekday, day, month } = formatDay(iso);
    const prefix = iso === toISODate(new Date()) ? "Today" : `Day ${idx + 1}`;
    return `${prefix} · ${weekday}, ${month} ${day}`;
  })();

  const saveActivity = (data: Omit<Activity, "id">, id?: string) => {
    if (id) onUpdateActivity(id, data);
    else onAddActivity(data);
    if (data.date !== selectedDay) setSelectedDay(data.date);
    setSheet(null);
  };

  // people on the trip: organiser + collaborators (cap the avatar stack)
  const people = [
    { id: "owner", name: trip.sharedBy ?? profileName ?? "You", role: trip.role },
    ...trip.collaborators,
  ];

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
        right={
          <div className="flex items-center gap-2">
            {/* avatar stack */}
            <div className="hidden items-center -space-x-2 sm:flex">
              {people.slice(0, 4).map((p) => (
                <span
                  key={p.id}
                  title={p.name}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-bg text-[10px] font-bold text-white"
                  style={{ background: avatarColor(p.name) }}
                >
                  {initials(p.name)}
                </span>
              ))}
              {people.length > 4 && (
                <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-bg bg-surface-2 text-[10px] font-bold text-text-soft">
                  +{people.length - 4}
                </span>
              )}
            </div>
            {readOnly ? (
              <span className="flex items-center gap-1 rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold text-text-soft">
                👀 View only
              </span>
            ) : (
              <button
                onClick={() => setShowShare(true)}
                className="btn btn-primary px-3 py-2 text-sm"
                aria-label="Share trip"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
                </svg>
                <span className="hidden sm:inline">Share</span>
              </button>
            )}
          </div>
        }
      />

      {trip.sharedBy && (
        <div className="border-b border-border bg-brand-soft/40 px-5 py-2 text-center text-xs font-medium text-brand-strong sm:px-8">
          Shared by {trip.sharedBy} · {readOnly ? "you can view this trip" : "you can edit this trip"}
        </div>
      )}

      <TripHeader trip={trip} onUpdate={onUpdateTrip} readOnly={readOnly} />

      <div className="mx-auto max-w-5xl px-5 pt-6 sm:px-8">
        {/* view switcher */}
        <div className="flex justify-center sm:justify-start">
          <div className="segmented" role="tablist" aria-label="Planner view">
            <button
              role="tab"
              aria-selected={view === "itinerary"}
              onClick={() => setView("itinerary")}
              className={`segmented-item ${view === "itinerary" ? "is-active" : ""}`}
            >
              Itinerary
            </button>
            <button
              role="tab"
              aria-selected={view === "overview"}
              onClick={() => setView("overview")}
              className={`segmented-item ${view === "overview" ? "is-active" : ""}`}
            >
              Overview
            </button>
          </div>
        </div>

        {view === "itinerary" ? (
          <>
            <div className="mt-5">
              <DayRail
                days={days}
                selected={selectedDay || days[0] || ""}
                counts={counts}
                onSelect={setSelectedDay}
              />
            </div>

            <DayTimeline
              key={selectedDay}
              activities={dayActivities}
              currency={trip.currency}
              dayLabel={selectedLabel}
              readOnly={readOnly}
              isToday={(selectedDay || days[0]) === toISODate(new Date())}
              onAdd={() => setSheet({ date: selectedDay || days[0] })}
              onEdit={(a) => setSheet({ date: a.date, activity: a })}
              onDelete={onRemoveActivity}
              onToggleDone={onToggleDone}
            />
          </>
        ) : (
          <TripOverview
            days={days}
            activities={trip.activities}
            currency={trip.currency}
            readOnly={readOnly}
            onJumpToDay={(date) => {
              setSelectedDay(date);
              setView("itinerary");
            }}
            onEdit={(a) => setSheet({ date: a.date, activity: a })}
          />
        )}
      </div>

      {!readOnly && (
        <button
          onClick={() => setSheet({ date: selectedDay || days[0] })}
          className="btn btn-primary fixed bottom-5 right-5 z-30 h-14 w-14 !p-0 shadow-[var(--shadow-lg)] sm:hidden"
          aria-label="Add plan"
        >
          <PlusIcon width={24} height={24} />
        </button>
      )}

      {sheet && !readOnly && (
        <ActivitySheet
          state={sheet}
          currency={trip.currency}
          days={days}
          onClose={() => setSheet(null)}
          onSave={saveActivity}
        />
      )}

      {showShare && (
        <ShareModal
          trip={trip}
          fromName={profileName}
          onChangeName={onChangeProfileName}
          onAdd={onAddCollaborator}
          onUpdate={onUpdateCollaborator}
          onRemove={onRemoveCollaborator}
          onClose={() => setShowShare(false)}
        />
      )}
    </main>
  );
}
