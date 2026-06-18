"use client";

import { useMemo, useState } from "react";
import type { Trip } from "@/lib/types";
import { tripStats } from "@/lib/tripStats";
import TopBar from "./TopBar";
import TripCard from "./TripCard";
import { PlusIcon } from "./Icons";

type SortKey = "recent" | "date" | "name";

interface Props {
  trips: Trip[];
  onOpen: (id: string) => void;
  onNew: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

const SORTS: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Recently edited" },
  { key: "date", label: "Trip date" },
  { key: "name", label: "Name" },
];

export default function TripsDashboard({ trips, onOpen, onNew, onDuplicate, onDelete }: Props) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = trips.filter(
      (t) =>
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q),
    );
    const sorted = [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "date") return (a.startDate || "9999").localeCompare(b.startDate || "9999");
      return b.updatedAt - a.updatedAt;
    });
    return sorted;
  }, [trips, query, sort]);

  const groups = useMemo(() => {
    const planned: Trip[] = [];
    const past: Trip[] = [];
    filtered.forEach((t) => {
      (tripStats(t).status === "past" ? past : planned).push(t);
    });
    return { planned, past };
  }, [filtered]);

  const totalSpent = trips.reduce(
    (s, t) => s + t.activities.reduce((x, a) => x + (a.cost || 0), 0),
    0,
  );

  let cardIndex = 0;
  const renderGroup = (label: string, list: Trip[]) =>
    list.length > 0 && (
      <section className="mt-8 first:mt-0">
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="font-display text-lg font-bold">{label}</h2>
          <span className="text-sm text-text-faint">{list.length}</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => (
            <TripCard
              key={t.id}
              trip={t}
              index={cardIndex++}
              onOpen={() => onOpen(t.id)}
              onDuplicate={() => onDuplicate(t.id)}
              onDelete={() => onDelete(t.id)}
            />
          ))}
        </div>
      </section>
    );

  return (
    <main className="min-h-[100dvh] pb-24">
      <TopBar
        right={
          <button onClick={onNew} className="btn btn-primary px-4 py-2 text-sm">
            <PlusIcon width={17} height={17} />
            <span className="hidden sm:inline">New trip</span>
          </button>
        }
      />

      <div className="mx-auto max-w-6xl px-4 pt-7 sm:px-6">
        {/* heading */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Your trips
            </h1>
            <p className="mt-1 text-text-soft">
              {trips.length} {trips.length === 1 ? "trip" : "trips"} planned
              {totalSpent > 0 && <> · {trips[0]?.currency}{totalSpent.toLocaleString()} mapped out</>}
            </p>
          </div>
        </div>

        {/* controls */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              className="field !pl-10"
              placeholder="Search trips or destinations…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
            {SORTS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSort(s.key)}
                className={`chip shrink-0 ${
                  sort === s.key ? "!border-brand !bg-brand-soft !text-brand-strong" : ""
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* content */}
        {filtered.length === 0 ? (
          <div className="card mt-8 flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="text-4xl">🧳</span>
            <p className="font-semibold">
              {query ? "No trips match that search" : "No trips yet"}
            </p>
            {!query && (
              <button onClick={onNew} className="btn btn-primary mt-1 px-4 py-2 text-sm">
                <PlusIcon width={16} height={16} /> Plan your first trip
              </button>
            )}
          </div>
        ) : (
          <div className="mt-7">
            {renderGroup("Upcoming & current", groups.planned)}
            {renderGroup("Past trips", groups.past)}
          </div>
        )}
      </div>

      {/* floating new (mobile) */}
      <button
        onClick={onNew}
        className="btn btn-primary fixed bottom-5 right-5 z-30 h-14 w-14 !p-0 shadow-[var(--shadow-lg)] sm:hidden"
        aria-label="New trip"
      >
        <PlusIcon width={24} height={24} />
      </button>
    </main>
  );
}
