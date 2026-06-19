"use client";

import { useEffect } from "react";
import type { Trip } from "@/lib/types";
import { COVERS, TRIP_EMOJIS, coverGradient } from "@/lib/types";
import { CloseIcon } from "./Icons";

interface Props {
  trip: Trip;
  onUpdate: (patch: Partial<Trip>) => void;
  onClose: () => void;
}

export default function TripCustomizeSheet({ trip, onUpdate, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Customise trip"
    >
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        style={{ animation: "var(--animate-scrim)" }}
        onClick={onClose}
      />
      <div
        className="card relative z-10 max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-b-none rounded-t-[1.75rem] p-0 sm:rounded-[1.75rem]"
        style={{ animation: "var(--animate-sheet)" }}
      >
        {/* live preview */}
        <div
          className="relative flex h-24 items-center gap-3 px-5"
          style={{ background: coverGradient(trip.cover) }}
        >
          <span className="text-5xl drop-shadow-sm">{trip.emoji}</span>
          <div className="min-w-0 text-white drop-shadow">
            <p className="truncate font-display text-xl font-extrabold">{trip.name || "Your trip"}</p>
            <p className="truncate text-sm text-white/85">{trip.destination || "Where to?"}</p>
          </div>
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
            aria-label="Close"
          >
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border sm:hidden" />

          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-faint">
            Icon
          </span>
          <div className="flex flex-wrap gap-1.5">
            {TRIP_EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => onUpdate({ emoji: e })}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border text-lg transition-all ${
                  trip.emoji === e
                    ? "scale-110 border-brand bg-brand-soft"
                    : "border-border hover:border-text-faint"
                }`}
              >
                {e}
              </button>
            ))}
          </div>

          <span className="mb-1.5 mt-4 block text-xs font-semibold uppercase tracking-wide text-text-faint">
            Cover
          </span>
          <div className="flex flex-wrap gap-2">
            {COVERS.map((c, i) => (
              <button
                key={c.name}
                aria-label={c.name}
                onClick={() => onUpdate({ cover: i })}
                className={`h-9 w-9 rounded-xl transition-transform ${
                  trip.cover === i ? "scale-110 ring-2 ring-text ring-offset-2 ring-offset-surface" : ""
                }`}
                style={{ background: coverGradient(i) }}
              />
            ))}
          </div>

          <button onClick={onClose} className="btn btn-primary mt-6 w-full py-2.5">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
