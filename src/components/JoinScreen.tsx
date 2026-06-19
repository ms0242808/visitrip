"use client";

import type { InvitePayload } from "@/lib/share";
import { coverGradient } from "@/lib/types";
import { formatRange } from "@/lib/dates";
import ThemeToggle from "./ThemeToggle";
import { CalendarIcon, CompassIcon, MapPinIcon, PlaneIcon } from "./Icons";

interface Props {
  payload: InvitePayload;
  onAccept: () => void;
  onDecline: () => void;
}

export default function JoinScreen({ payload, onAccept, onDecline }: Props) {
  const { trip, role, from } = payload;
  const plans = trip.activities.length;

  return (
    <main className="flex min-h-[100dvh] flex-col">
      <div className="flex items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-white">
            <PlaneIcon width={18} height={18} />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight">
            Visi<span className="text-brand">trip</span>
          </span>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center px-5 pb-10">
        <div
          className="card w-full max-w-md overflow-hidden p-0"
          style={{ animation: "var(--animate-fade-up)" }}
        >
          {/* cover */}
          <div
            className="relative flex h-32 items-end p-5"
            style={{ background: coverGradient(trip.cover) }}
          >
            <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#1b1a17]">
              {role === "editor" ? "✏️ Can edit" : "👀 View only"}
            </span>
            <span className="text-5xl drop-shadow-sm">{trip.emoji}</span>
          </div>

          <div className="p-6">
            <p className="text-sm font-semibold text-brand-strong">
              {from} invited you to collaborate
            </p>
            <h1 className="mt-1 font-display text-2xl font-extrabold leading-tight">{trip.name}</h1>

            <div className="mt-3 flex flex-col gap-1.5 text-sm text-text-soft">
              <span className="flex items-center gap-2">
                <MapPinIcon width={15} height={15} />
                {trip.destination || "No destination yet"}
              </span>
              <span className="flex items-center gap-2">
                <CalendarIcon width={15} height={15} />
                {formatRange(trip.startDate, trip.endDate)}
              </span>
              <span className="flex items-center gap-2">
                <CompassIcon width={15} height={15} />
                {plans} {plans === 1 ? "plan" : "plans"} mapped out
              </span>
            </div>

            <p className="mt-4 rounded-xl bg-surface-2 px-3.5 py-2.5 text-xs text-text-faint">
              You&apos;ll get your own copy to {role === "editor" ? "edit" : "explore"}. It&apos;s
              saved on this device.
            </p>

            <div className="mt-5 flex gap-3">
              <button onClick={onDecline} className="btn btn-outline flex-1 py-2.5">
                Not now
              </button>
              <button onClick={onAccept} className="btn btn-primary flex-1 py-2.5">
                {role === "editor" ? "Join & edit" : "View trip"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
