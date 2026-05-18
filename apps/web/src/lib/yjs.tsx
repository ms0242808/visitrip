import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";
import type { User } from "@visitrip/shared";

interface PresencePeer {
  clientId: number;
  user: { id: string; name: string };
}

interface TripDocValue {
  doc: Y.Doc;
  provider: WebsocketProvider;
  packing: Y.Array<Y.Map<unknown>>;
}

const TripDocContext = createContext<TripDocValue | null>(null);

function buildWsUrl(tripId: string): string {
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  const url = new URL(`${proto}//${window.location.host}/api/realtime`);
  url.searchParams.set("trip", tripId);
  return url.toString();
}

interface TripDocProviderProps {
  tripId: string;
  user: User;
  children: ReactNode;
}

export function TripDocProvider({ tripId, user, children }: TripDocProviderProps) {
  const value = useMemo<TripDocValue>(() => {
    const doc = new Y.Doc();
    const wsUrl = buildWsUrl(tripId);
    const parsed = new URL(wsUrl);
    const baseUrl = `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
    const provider = new WebsocketProvider(baseUrl, tripId, doc, {
      params: { trip: tripId },
      connect: true,
    });
    provider.awareness.setLocalState({
      user: { id: user.id, name: user.name },
    });
    return {
      doc,
      provider,
      packing: doc.getArray<Y.Map<unknown>>("packing"),
    };
  }, [tripId, user.id, user.name]);

  useEffect(() => {
    return () => {
      value.provider.awareness.setLocalState(null);
      value.provider.destroy();
      value.doc.destroy();
    };
  }, [value]);

  return <TripDocContext.Provider value={value}>{children}</TripDocContext.Provider>;
}

export function useTripDoc(): TripDocValue {
  const ctx = useContext(TripDocContext);
  if (!ctx) throw new Error("useTripDoc must be used inside <TripDocProvider>");
  return ctx;
}

export function useTripDocOptional(): TripDocValue | null {
  return useContext(TripDocContext);
}

export function useYArray<T>(arr: Y.Array<T>): T[] {
  const subscribe = useMemo(
    () => (cb: () => void) => {
      arr.observeDeep(cb);
      return () => arr.unobserveDeep(cb);
    },
    [arr],
  );
  const [snapshot, setSnapshot] = useState<T[]>(() => arr.toArray());
  useEffect(() => {
    const update = () => setSnapshot(arr.toArray());
    arr.observeDeep(update);
    update();
    return () => arr.unobserveDeep(update);
  }, [arr]);
  void subscribe;
  return snapshot;
}

export function usePresence(): PresencePeer[] {
  const value = useTripDocOptional();
  const awareness = value?.provider.awareness;

  const subscribe = useMemo(
    () => (cb: () => void) => {
      if (!awareness) return () => {};
      awareness.on("change", cb);
      return () => awareness.off("change", cb);
    },
    [awareness],
  );

  const getSnapshot = () => {
    if (!awareness) return EMPTY_PEERS;
    const peers: PresencePeer[] = [];
    awareness.getStates().forEach((state, clientId) => {
      const u = (state as { user?: { id: string; name: string } }).user;
      if (u) peers.push({ clientId, user: u });
    });
    return peers;
  };

  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_PEERS);
}

const EMPTY_PEERS: PresencePeer[] = [];

interface ConnectionState {
  connected: boolean;
}

export function useConnection(): ConnectionState {
  const value = useTripDocOptional();
  const provider = value?.provider;
  const subscribe = useMemo(
    () => (cb: () => void) => {
      if (!provider) return () => {};
      provider.on("status", cb);
      return () => provider.off("status", cb);
    },
    [provider],
  );
  return useSyncExternalStore(
    subscribe,
    () => ({ connected: provider?.wsconnected ?? false }),
    () => ({ connected: false }),
  );
}
