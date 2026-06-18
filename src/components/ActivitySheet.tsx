"use client";

import { useEffect, useState } from "react";
import type { Activity, CategoryId } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import { formatDay } from "@/lib/dates";
import { CloseIcon } from "./Icons";

export interface SheetState {
  date: string;
  /** when editing an existing activity */
  activity?: Activity;
}

interface Props {
  state: SheetState;
  currency: string;
  onClose: () => void;
  onSave: (data: Omit<Activity, "id">, id?: string) => void;
}

export default function ActivitySheet({ state, currency, onClose, onSave }: Props) {
  const editing = state.activity;
  const [title, setTitle] = useState(editing?.title ?? "");
  const [category, setCategory] = useState<CategoryId>(editing?.category ?? "sightseeing");
  const [time, setTime] = useState(editing?.time ?? "");
  const [location, setLocation] = useState(editing?.location ?? "");
  const [cost, setCost] = useState<string>(
    editing?.cost != null ? String(editing.cost) : "",
  );
  const [notes, setNotes] = useState(editing?.notes ?? "");

  // Close on Escape
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
    if (!title.trim()) return;
    onSave(
      {
        date: state.date,
        title: title.trim(),
        category,
        time: time || undefined,
        location: location.trim() || undefined,
        cost: cost ? Number(cost) : undefined,
        notes: notes.trim() || undefined,
        done: editing?.done ?? false,
      },
      editing?.id,
    );
  };

  const { weekday, day, month } = formatDay(state.date);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={editing ? "Edit plan" : "Add plan"}
    >
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        style={{ animation: "var(--animate-scrim)" }}
        onClick={onClose}
      />

      <form
        onSubmit={submit}
        className="card relative z-10 max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-b-none rounded-t-[1.75rem] p-5 sm:rounded-[1.75rem] sm:p-6"
        style={{ animation: "var(--animate-sheet)" }}
      >
        {/* mobile grab handle */}
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border sm:hidden" />

        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-xl font-bold">
              {editing ? "Edit plan" : "Add a plan"}
            </h3>
            <p className="text-sm text-text-faint">
              {weekday}, {month} {day}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost h-9 w-9 !p-0"
            aria-label="Close"
          >
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        {/* category picker */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {CATEGORIES.map((c) => {
            const active = c.id === category;
            const color = `var(${c.colorVar})`;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={[
                  "flex flex-col items-center gap-1 rounded-xl border py-2.5 text-xs font-semibold transition-all duration-150",
                  active ? "scale-[1.03] text-white" : "border-border bg-surface text-text-soft hover:border-text-faint",
                ].join(" ")}
                style={active ? { background: color, borderColor: color } : undefined}
              >
                <span className="text-lg">{c.emoji}</span>
                {c.label}
              </button>
            );
          })}
        </div>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-faint">
            What’s the plan?
          </span>
          <input
            className="field"
            placeholder="e.g. Sunrise at Fushimi Inari"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </label>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-faint">
              Time
            </span>
            <input
              type="time"
              className="field"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-faint">
              Cost ({currency})
            </span>
            <input
              type="number"
              min={0}
              className="field"
              placeholder="0"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </label>
        </div>

        <label className="mt-3 block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-faint">
            Location
          </span>
          <input
            className="field"
            placeholder="Add a place"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </label>

        <label className="mt-3 block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-faint">
            Notes
          </span>
          <textarea
            className="field min-h-[64px] resize-none"
            placeholder="Tickets, reservations, tips…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        <div className="sticky bottom-0 -mx-5 mt-5 flex gap-3 border-t border-border bg-surface px-5 pt-4 sm:-mx-6 sm:px-6">
          <button type="button" onClick={onClose} className="btn btn-outline flex-1 py-2.5">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="btn btn-primary flex-1 py-2.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {editing ? "Save changes" : "Add to day"}
          </button>
        </div>
      </form>
    </div>
  );
}
