import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
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
  polls: Y.Array<Y.Map<unknown>>;
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
  const [value] = useState<TripDocValue>(() => {
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
      polls: doc.getArray<Y.Map<unknown>>("polls"),
    };
  });

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
  const cacheRef = useRef<T[]>([]);
  const dirtyRef = useRef(true);

  const subscribe = useCallback(
    (cb: () => void) => {
      const handler = () => {
        dirtyRef.current = true;
        cb();
      };
      arr.observeDeep(handler);
      return () => arr.unobserveDeep(handler);
    },
    [arr],
  );

  const getSnapshot = useCallback(() => {
    if (dirtyRef.current) {
      cacheRef.current = arr.toArray();
      dirtyRef.current = false;
    }
    return cacheRef.current;
  }, [arr]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

const EMPTY_PEERS: PresencePeer[] = [];

function readPeers(awareness: WebsocketProvider["awareness"] | undefined): PresencePeer[] {
  if (!awareness) return EMPTY_PEERS;
  const peers: PresencePeer[] = [];
  awareness.getStates().forEach((state, clientId) => {
    const u = (state as { user?: { id: string; name: string } }).user;
    if (u) peers.push({ clientId, user: u });
  });
  return peers.length === 0 ? EMPTY_PEERS : peers;
}

function peersEqual(a: PresencePeer[], b: PresencePeer[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i]!;
    const y = b[i]!;
    if (x.clientId !== y.clientId || x.user.id !== y.user.id || x.user.name !== y.user.name) {
      return false;
    }
  }
  return true;
}

export function usePresence(): PresencePeer[] {
  const value = useTripDocOptional();
  const awareness = value?.provider.awareness;
  const cacheRef = useRef<PresencePeer[]>(EMPTY_PEERS);

  const subscribe = useCallback(
    (cb: () => void) => {
      if (!awareness) return () => {};
      const handler = () => {
        const next = readPeers(awareness);
        if (!peersEqual(cacheRef.current, next)) cacheRef.current = next;
        cb();
      };
      awareness.on("change", handler);
      return () => awareness.off("change", handler);
    },
    [awareness],
  );

  const getSnapshot = useCallback(() => {
    const next = readPeers(awareness);
    if (!peersEqual(cacheRef.current, next)) cacheRef.current = next;
    return cacheRef.current;
  }, [awareness]);

  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_PEERS);
}

interface ConnectionState {
  connected: boolean;
}

const DISCONNECTED: ConnectionState = { connected: false };
const CONNECTED: ConnectionState = { connected: true };

export function useConnection(): ConnectionState {
  const value = useTripDocOptional();
  const provider = value?.provider;

  const subscribe = useCallback(
    (cb: () => void) => {
      if (!provider) return () => {};
      provider.on("status", cb);
      return () => provider.off("status", cb);
    },
    [provider],
  );

  const getSnapshot = useCallback(
    () => (provider?.wsconnected ? CONNECTED : DISCONNECTED),
    [provider],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => DISCONNECTED);
}
