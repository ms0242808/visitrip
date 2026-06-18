"use client";

import { useEffect, useState } from "react";
import type { Trip } from "@/lib/types";
import { COVERS, CURRENCIES, TRIP_EMOJIS, coverGradient } from "@/lib/types";
import { addDays, toISODate } from "@/lib/dates";
import { CloseIcon } from "./Icons";

interface Props {
  onClose: () => void;
  onCreate: (trip: Partial<Trip>) => void;
  initial?: Partial<Trip>;
}

export default function NewTripModal({ onClose, onCreate, initial }: Props) {
  const today = toISODate(new Date());
  const [name, setName] = useState(initial?.name ?? "");
  const [destination, setDestination] = useState(initial?.destination ?? "");
  const [startDate, setStartDate] = useState(initial?.startDate ?? addDays(today, 7));
  const [endDate, setEndDate] = useState(initial?.endDate ?? addDays(today, 10));
  const [emoji, setEmoji] = useState(initial?.emoji ?? "✈️");
  const [cover, setCover] = useState(initial?.cover ?? 0);
  const [currency, setCurrency] = useState(initial?.currency ?? "$");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      name: name.trim() || "My Trip",
      destination: destination.trim(),
      startDate,
      endDate: endDate < startDate ? startDate : endDate,
      emoji,
      cover,
      currency,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="New trip"
    >
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        style={{ animation: "var(--animate-scrim)" }}
        onClick={onClose}
      />
      <form
        onSubmit={submit}
        className="card relative z-10 max-h-[94dvh] w-full max-w-lg overflow-y-auto rounded-b-none rounded-t-[1.75rem] p-0 sm:rounded-[1.75rem]"
        style={{ animation: "var(--animate-sheet)" }}
      >
        {/* live cover preview */}
        <div
          className="relative flex h-24 items-center gap-3 px-5"
          style={{ background: coverGradient(cover) }}
        >
          <span className="text-5xl drop-shadow-sm">{emoji}</span>
          <div className="min-w-0 text-white drop-shadow">
            <p className="truncate font-display text-xl font-extrabold">
              {name || "Name your trip"}
            </p>
            <p className="truncate text-sm text-white/85">{destination || "Where to?"}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
            aria-label="Close"
          >
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border sm:hidden" />

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-faint">
              Trip name
            </span>
            <input
              className="field"
              placeholder="Summer in Kyoto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </label>

          <label className="mt-3 block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-faint">
              Destination
            </span>
            <input
              className="field"
              placeholder="Kyoto, Japan"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </label>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-faint">
                Start
              </span>
              <input
                type="date"
                className="field"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-faint">
                End
              </span>
              <input
                type="date"
                className="field"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
          </div>

          {/* emoji */}
          <span className="mb-1.5 mt-4 block text-xs font-semibold uppercase tracking-wide text-text-faint">
            Icon
          </span>
          <div className="flex flex-wrap gap-1.5">
            {TRIP_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border text-lg transition-all ${
                  emoji === e
                    ? "scale-110 border-brand bg-brand-soft"
                    : "border-border hover:border-text-faint"
                }`}
              >
                {e}
              </button>
            ))}
          </div>

          {/* cover */}
          <span className="mb-1.5 mt-4 block text-xs font-semibold uppercase tracking-wide text-text-faint">
            Cover
          </span>
          <div className="flex flex-wrap gap-2">
            {COVERS.map((c, i) => (
              <button
                key={c.name}
                type="button"
                aria-label={c.name}
                onClick={() => setCover(i)}
                className={`h-9 w-9 rounded-xl transition-transform ${
                  cover === i ? "scale-110 ring-2 ring-text ring-offset-2 ring-offset-surface" : ""
                }`}
                style={{ background: coverGradient(i) }}
              />
            ))}
          </div>

          {/* currency */}
          <span className="mb-1.5 mt-4 block text-xs font-semibold uppercase tracking-wide text-text-faint">
            Currency
          </span>
          <div className="flex flex-wrap gap-1.5">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={`chip ${currency === c ? "!border-brand !bg-brand-soft !text-brand-strong" : ""}`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button type="button" onClick={onClose} className="btn btn-outline flex-1 py-2.5">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1 py-2.5">
              Create trip
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
