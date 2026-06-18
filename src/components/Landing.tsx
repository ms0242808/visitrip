"use client";

import { useState } from "react";
import { CompassIcon, PlaneIcon, PlusIcon, SparkleIcon } from "./Icons";

interface Props {
  onCreate: (name: string, destination: string) => void;
  onLoadSample: () => void;
}

const SUGGESTIONS = [
  { name: "Lisbon Long Weekend", dest: "Lisbon, Portugal", emoji: "🇵🇹" },
  { name: "Iceland Ring Road", dest: "Reykjavík, Iceland", emoji: "🇮🇸" },
  { name: "Bali Reset", dest: "Bali, Indonesia", emoji: "🇮🇩" },
];

export default function Landing({ onCreate, onLoadSample }: Props) {
  const [name, setName] = useState("");
  const [dest, setDest] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(name.trim() || "My Trip", dest.trim());
  };

  return (
    <div className="relative mx-auto flex max-w-5xl flex-col items-center px-5 pt-10 pb-24 text-center sm:pt-20">
      <span
        className="chip !bg-brand-soft !text-brand-strong !border-transparent"
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
            <path
              d="M2 8c40-6 120-6 196-2"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
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
        className="card mt-10 w-full max-w-xl p-3 text-left sm:p-4"
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
        className="btn btn-ghost mt-6 px-4 py-2 text-sm"
        style={{ animation: "var(--animate-fade-up)", animationDelay: "160ms" }}
      >
        <CompassIcon width={17} height={17} /> Or explore three ready-made sample trips
      </button>

      <div
        className="mt-16 grid w-full max-w-3xl gap-4 sm:grid-cols-3"
        style={{ animation: "var(--animate-fade-up)", animationDelay: "200ms" }}
      >
        {[
          { icon: <CompassIcon />, t: "Plan by day", d: "A clear timeline for every morning, noon and night." },
          { icon: <PlaneIcon />, t: "Everything in one place", d: "Flights, stays, food and sights side by side." },
          { icon: <SparkleIcon />, t: "Stay on budget", d: "Watch your spend add up as you build." },
        ].map((f) => (
          <div key={f.t} className="card p-5 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-strong">
              {f.icon}
            </div>
            <h3 className="mt-3 font-semibold">{f.t}</h3>
            <p className="mt-1 text-sm text-text-soft">{f.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
