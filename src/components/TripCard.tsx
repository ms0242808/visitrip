"use client";

import { useEffect, useRef, useState } from "react";
import type { Trip } from "@/lib/types";
import { coverGradient } from "@/lib/types";
import { formatRange } from "@/lib/dates";
import { countdownLabel, tripStats } from "@/lib/tripStats";
import { CalendarIcon, CompassIcon, MapPinIcon, TrashIcon, WalletIcon } from "./Icons";

interface Props {
  trip: Trip;
  index: number;
  onOpen: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const STATUS_STYLE: Record<string, string> = {
  ongoing: "bg-activity-cat/15 text-activity-cat",
  upcoming: "bg-brand-soft text-brand-strong",
  past: "bg-text-faint/15 text-text-faint",
  draft: "bg-border text-text-soft",
};

export default function TripCard({ trip, index, onOpen, onDuplicate, onDelete }: Props) {
  const stats = tripStats(trip);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menu]);

  return (
    <article
      className="group relative"
      style={{ animation: "var(--animate-fade-up)", animationDelay: `${index * 60}ms` }}
    >
      {/* boarding-pass card: cover stub + body, joined by a perforated notch */}
      <button
        onClick={onOpen}
        className="card block w-full overflow-hidden p-0 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
        aria-label={`Open ${trip.name}`}
      >
        {/* cover */}
        <div
          className="relative h-28 w-full overflow-hidden"
          style={{ background: coverGradient(trip.cover) }}
        >
          <div className="absolute inset-0 opacity-30 mix-blend-soft-light [background:radial-gradient(circle_at_20%_20%,#fff,transparent_40%)]" />
          <span className="absolute left-4 top-3 text-4xl drop-shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
            {trip.emoji}
          </span>
          <span
            className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur-sm ${
              stats.status === "past"
                ? "bg-black/30 text-white"
                : "bg-white/90 text-[#1b1a17]"
            }`}
          >
            {countdownLabel(stats)}
          </span>
          {/* boarding-pass perforation */}
          <span className="absolute -bottom-2.5 left-0 right-0 flex justify-between px-1">
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} className="h-5 w-5 rounded-full bg-surface" />
            ))}
          </span>
        </div>

        {/* body */}
        <div className="p-4 pt-5">
          <h3 className="truncate font-display text-lg font-bold leading-tight">{trip.name}</h3>
          <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-text-soft">
            <MapPinIcon width={14} height={14} className="shrink-0" />
            {trip.destination || "No destination yet"}
          </p>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-text-faint">
            <CalendarIcon width={14} height={14} />
            <span className="truncate">{formatRange(trip.startDate, trip.endDate)}</span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLE[stats.status]}`}
            >
              {stats.status}
            </span>
            <span className="flex items-center gap-1 text-text-soft">
              <CalendarIcon width={13} height={13} /> {stats.days}d
            </span>
            <span className="flex items-center gap-1 text-text-soft">
              <CompassIcon width={13} height={13} /> {stats.plans}
            </span>
            {stats.spent > 0 && (
              <span className="flex items-center gap-1 font-medium text-text-soft">
                <WalletIcon width={13} height={13} /> {trip.currency}
                {stats.spent.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* kebab menu */}
      <div ref={menuRef} className="absolute right-3 bottom-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenu((m) => !m);
          }}
          className="btn btn-ghost h-8 w-8 !p-0 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
          aria-label="Trip options"
          aria-expanded={menu}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.6" />
            <circle cx="12" cy="12" r="1.6" />
            <circle cx="12" cy="19" r="1.6" />
          </svg>
        </button>
        {menu && (
          <div
            className="card absolute bottom-10 right-0 z-20 w-40 overflow-hidden p-1.5 shadow-[var(--shadow-lg)]"
            style={{ animation: "var(--animate-pop)" }}
          >
            <button
              onClick={() => {
                onDuplicate();
                setMenu(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-soft transition-colors hover:bg-surface-2 hover:text-text"
            >
              Duplicate
            </button>
            <button
              onClick={() => {
                setMenu(false);
                onDelete();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-lodging transition-colors hover:bg-lodging/10"
            >
              <TrashIcon width={15} height={15} /> Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
