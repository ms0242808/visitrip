"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Activity, Trip } from "./types";

const KEY = "visitrip.app.v2";
const LEGACY_KEY = "visitrip.trip.v1";

interface Persisted {
  trips: Trip[];
  activeId: string | null;
}

function uid(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Fill any fields missing from older/partial data. */
function normalizeTrip(t: Partial<Trip>): Trip {
  const now = Date.now();
  return {
    id: t.id ?? uid("trip"),
    name: t.name ?? "Untitled trip",
    destination: t.destination ?? "",
    startDate: t.startDate ?? "",
    endDate: t.endDate ?? "",
    currency: t.currency ?? "$",
    budget: t.budget,
    activities: t.activities ?? [],
    cover: t.cover ?? 0,
    emoji: t.emoji ?? "✈️",
    createdAt: t.createdAt ?? now,
    updatedAt: t.updatedAt ?? now,
  };
}

function load(): Persisted {
  if (typeof window === "undefined") return { trips: [], activeId: null };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Persisted;
      return {
        trips: (parsed.trips ?? []).map(normalizeTrip),
        activeId: parsed.activeId ?? null,
      };
    }
    // migrate a single legacy trip into the collection
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const trip = normalizeTrip(JSON.parse(legacy) as Partial<Trip>);
      return { trips: [trip], activeId: null };
    }
  } catch {
    /* ignore corrupt storage */
  }
  return { trips: [], activeId: null };
}

export interface TripsStore {
  trips: Trip[];
  activeId: string | null;
  active: Trip | null;
  hydrated: boolean;
  createTrip: (t: Partial<Trip>) => string;
  updateTrip: (id: string, patch: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  duplicateTrip: (id: string) => void;
  openTrip: (id: string | null) => void;
  importTrips: (trips: Trip[]) => void;
  // activity ops on a specific trip
  addActivity: (tripId: string, a: Omit<Activity, "id">) => void;
  updateActivity: (tripId: string, id: string, patch: Partial<Activity>) => void;
  removeActivity: (tripId: string, id: string) => void;
  toggleDone: (tripId: string, id: string) => void;
}

export function useTrips(): TripsStore {
  const [state, setState] = useState<Persisted>({ trips: [], activeId: null });
  const [hydrated, setHydrated] = useState(false);
  const skipPersist = useRef(true);

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  /** Apply a patch to one trip and bump its updatedAt. */
  const patchTrip = useCallback(
    (id: string, fn: (t: Trip) => Trip) => {
      setState((s) => ({
        ...s,
        trips: s.trips.map((t) => (t.id === id ? { ...fn(t), updatedAt: Date.now() } : t)),
      }));
    },
    [],
  );

  const createTrip = useCallback((t: Partial<Trip>): string => {
    const trip = normalizeTrip({ ...t, id: uid("trip") });
    setState((s) => ({ ...s, trips: [trip, ...s.trips] }));
    return trip.id;
  }, []);

  const updateTrip = useCallback(
    (id: string, patch: Partial<Trip>) => patchTrip(id, (t) => ({ ...t, ...patch })),
    [patchTrip],
  );

  const deleteTrip = useCallback((id: string) => {
    setState((s) => ({
      activeId: s.activeId === id ? null : s.activeId,
      trips: s.trips.filter((t) => t.id !== id),
    }));
  }, []);

  const duplicateTrip = useCallback((id: string) => {
    setState((s) => {
      const src = s.trips.find((t) => t.id === id);
      if (!src) return s;
      const now = Date.now();
      const copy: Trip = {
        ...src,
        id: uid("trip"),
        name: `${src.name} (copy)`,
        createdAt: now,
        updatedAt: now,
        activities: src.activities.map((a) => ({ ...a, id: uid("a") })),
      };
      const idx = s.trips.findIndex((t) => t.id === id);
      const trips = [...s.trips];
      trips.splice(idx + 1, 0, copy);
      return { ...s, trips };
    });
  }, []);

  const openTrip = useCallback((id: string | null) => {
    setState((s) => ({ ...s, activeId: id }));
  }, []);

  const importTrips = useCallback((trips: Trip[]) => {
    const normalized = trips.map(normalizeTrip);
    setState((s) => ({ ...s, trips: [...normalized, ...s.trips] }));
  }, []);

  const addActivity = useCallback(
    (tripId: string, a: Omit<Activity, "id">) =>
      patchTrip(tripId, (t) => ({ ...t, activities: [...t.activities, { ...a, id: uid("a") }] })),
    [patchTrip],
  );

  const updateActivity = useCallback(
    (tripId: string, id: string, patch: Partial<Activity>) =>
      patchTrip(tripId, (t) => ({
        ...t,
        activities: t.activities.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      })),
    [patchTrip],
  );

  const removeActivity = useCallback(
    (tripId: string, id: string) =>
      patchTrip(tripId, (t) => ({ ...t, activities: t.activities.filter((x) => x.id !== id) })),
    [patchTrip],
  );

  const toggleDone = useCallback(
    (tripId: string, id: string) =>
      patchTrip(tripId, (t) => ({
        ...t,
        activities: t.activities.map((x) => (x.id === id ? { ...x, done: !x.done } : x)),
      })),
    [patchTrip],
  );

  const active = state.trips.find((t) => t.id === state.activeId) ?? null;

  return {
    trips: state.trips,
    activeId: state.activeId,
    active,
    hydrated,
    createTrip,
    updateTrip,
    deleteTrip,
    duplicateTrip,
    openTrip,
    importTrips,
    addActivity,
    updateActivity,
    removeActivity,
    toggleDone,
  };
}
