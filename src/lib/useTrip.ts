"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Activity, Trip } from "./types";

const STORAGE_KEY = "visitrip.trip.v1";

function loadTrip(): Trip | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Trip) : null;
  } catch {
    return null;
  }
}

function uid(): string {
  return `a-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface TripStore {
  trip: Trip | null;
  hydrated: boolean;
  setTrip: (t: Trip | null) => void;
  updateTrip: (patch: Partial<Trip>) => void;
  addActivity: (a: Omit<Activity, "id">) => void;
  updateActivity: (id: string, patch: Partial<Activity>) => void;
  removeActivity: (id: string) => void;
  toggleDone: (id: string) => void;
  reset: () => void;
}

export function useTrip(): TripStore {
  const [trip, setTripState] = useState<Trip | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const firstRender = useRef(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setTripState(loadTrip());
    setHydrated(true);
  }, []);

  // Persist whenever trip changes (skip the very first hydration render)
  useEffect(() => {
    if (!hydrated) return;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    try {
      if (trip) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* storage might be unavailable; ignore */
    }
  }, [trip, hydrated]);

  const setTrip = useCallback((t: Trip | null) => setTripState(t), []);

  const updateTrip = useCallback((patch: Partial<Trip>) => {
    setTripState((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const addActivity = useCallback((a: Omit<Activity, "id">) => {
    setTripState((prev) =>
      prev ? { ...prev, activities: [...prev.activities, { ...a, id: uid() }] } : prev,
    );
  }, []);

  const updateActivity = useCallback((id: string, patch: Partial<Activity>) => {
    setTripState((prev) =>
      prev
        ? {
            ...prev,
            activities: prev.activities.map((x) => (x.id === id ? { ...x, ...patch } : x)),
          }
        : prev,
    );
  }, []);

  const removeActivity = useCallback((id: string) => {
    setTripState((prev) =>
      prev ? { ...prev, activities: prev.activities.filter((x) => x.id !== id) } : prev,
    );
  }, []);

  const toggleDone = useCallback((id: string) => {
    setTripState((prev) =>
      prev
        ? {
            ...prev,
            activities: prev.activities.map((x) =>
              x.id === id ? { ...x, done: !x.done } : x,
            ),
          }
        : prev,
    );
  }, []);

  const reset = useCallback(() => setTripState(null), []);

  return {
    trip,
    hydrated,
    setTrip,
    updateTrip,
    addActivity,
    updateActivity,
    removeActivity,
    toggleDone,
    reset,
  };
}
