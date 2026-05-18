import { useCallback, useEffect, useState } from "react";
import type { CreateTripInput, TripDetail, TripSummary } from "@visitrip/shared";
import { api } from "./api";

interface UseTripsResult {
  trips: TripSummary[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (input: CreateTripInput) => Promise<string>;
}

export function useTrips(): UseTripsResult {
  const [trips, setTrips] = useState<TripSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listTrips();
      setTrips(data.trips);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load trips");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(
    async (input: CreateTripInput) => {
      const { id } = await api.createTrip(input);
      await refresh();
      return id;
    },
    [refresh],
  );

  return { trips, loading, error, refresh, create };
}

interface UseTripResult {
  trip: TripDetail | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useTrip(id: string | null): UseTripResult {
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTrip(id);
      setTrip(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load trip");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { trip, loading, error, refresh };
}
