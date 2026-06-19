"use client";

import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { CompassIcon, PlaneIcon, PlusIcon, SparkleIcon, WalletIcon } from "./Icons";

interface Props {
  onCreate: (name: string, destination: string) => void;
  onLoadSample: () => void;
}

const SUGGESTIONS = [
  { name: "Lisbon Long Weekend", dest: "Lisbon, Portugal", emoji: "🇵🇹" },
  { name: "Iceland Ring Road", dest: "Reykjavík, Iceland", emoji: "🇮🇸" },
  { name: "Bali Reset", dest: "Bali, Indonesia", emoji: "🇮🇩" },
];

const PREVIEW = [
  { dot: "--c-transport", t: "Arrive at Kyoto Station", time: "9:30 AM" },
  { dot: "--c-lodging", t: "Check in at Machiya stay", time: "11:00 AM" },
  { dot: "--c-food", t: "Ramen at Ippudo", time: "1:00 PM", up: true },
];

const FEATURES = [
  { icon: <CompassIcon />, t: "Plan by day", d: "A clear timeline for every morning, noon and night.", tint: "--c-sight" },
  { icon: <PlaneIcon />, t: "Everything in one place", d: "Flights, stays, food and sights side by side.", tint: "--c-transport" },
  { icon: <WalletIcon />, t: "Stay on budget", d: "Watch your spend add up on a glanceable ring.", tint: "--brand" },
];

export default function Landing({ onCreate, onLoadSample }: Props) {
  const [name, setName] = useState("");
  const [dest, setDest] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(name.trim() || "My Trip", dest.trim());
  };

  return (
    <div className="relative">
      {/* brand bar */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-white">
            <PlaneIcon width={18} height={18} />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight">
            Visi<span className="text-brand">trip</span>
          </span>
        </div>
        <ThemeToggle />
      </header>

      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-5 pb-24 pt-6 text-center sm:pt-12">
        <span
          className="chip !border-transparent !bg-brand-soft !text-brand-strong"
          style={{ animation: "var(--animate-pop)" }}
        >
          <SparkleIcon width={15} height={15} /> Plan trips you’ll actually take
        </span>

        <h1
          className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl"
          style={{ animation: "var(--animate-fade-up)" }}
        >
          Turn the daydream into a
          <span className="relative ml-2 inline-block text-brand">
            day-by-day
            <svg
              className="absolute -bottom-2 left-0 w-full text-brand/40"
              viewBox="0 0 200 12"
              fill="none"
              preserveAspectRatio="none"
            >
              <path d="M2 8c40-6 120-6 196-2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </span>
          <br className="hidden sm:block" /> plan.
        </h1>

        <p
          className="mt-5 max-w-xl text-base text-text-soft sm:text-lg"
          style={{ animation: "var(--animate-fade-up)", animationDelay: "60ms" }}
        >
          Visitrip lays out your whole adventure on a clean timeline — sights, food,
          transit and budget in one calm, colourful place.
        </p>

        <form
          onSubmit={submit}
          className="card mt-9 w-full max-w-xl p-3 text-left sm:p-4"
          style={{ animation: "var(--animate-fade-up)", animationDelay: "120ms" }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1">
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
            <label className="flex-1">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-faint">
                Where to?
              </span>
              <input
                className="field"
                placeholder="Kyoto, Japan"
                value={dest}
                onChange={(e) => setDest(e.target.value)}
              />
            </label>
            <button type="submit" className="btn btn-primary h-[46px] px-5">
              <PlusIcon width={18} height={18} /> Start
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-text-faint">Try:</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s.name}
                type="button"
                className="chip"
                onClick={() => {
                  setName(s.name);
                  setDest(s.dest);
                }}
              >
                <span>{s.emoji}</span> {s.name}
              </button>
            ))}
          </div>
        </form>

        <button
          type="button"
          onClick={onLoadSample}
          className="btn btn-ghost mt-5 px-4 py-2 text-sm"
          style={{ animation: "var(--animate-fade-up)", animationDelay: "160ms" }}
        >
          <CompassIcon width={17} height={17} /> Or explore three ready-made sample trips
        </button>

        {/* floating itinerary preview */}
        <div
          className="relative mt-16 w-full max-w-xs"
          style={{ animation: "var(--animate-fade-up)", animationDelay: "200ms" }}
        >
          <div
            className="card p-4 text-left shadow-[var(--shadow-lg)]"
            style={{ animation: "bob 5s ease-in-out infinite" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-base font-bold">Day 1 · Kyoto</p>
                <p className="text-xs text-text-faint">Fri · 3 plans</p>
              </div>
              <span className="text-2xl">⛩️</span>
            </div>
            <ul className="mt-3 space-y-2">
              {PREVIEW.map((p) => (
                <li key={p.t} className="flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: `var(${p.dot})` }}
                  />
                  <span className="flex-1 truncate text-sm font-medium">{p.t}</span>
                  {p.up ? (
                    <span className="flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                      Up next
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold tabular-nums text-text-faint">
                      {p.time}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* feature cards */}
        <div
          className="mt-16 grid w-full max-w-3xl gap-4 sm:grid-cols-3"
          style={{ animation: "var(--animate-fade-up)", animationDelay: "240ms" }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.t}
              className="card p-5 text-left transition-transform duration-200 hover:-translate-y-1"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{
                  background: `color-mix(in srgb, var(${f.tint}) 15%, transparent)`,
                  color: `var(${f.tint})`,
                }}
              >
                {f.icon}
              </div>
              <h3 className="mt-3 font-semibold">{f.t}</h3>
              <p className="mt-1 text-sm text-text-soft">{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
