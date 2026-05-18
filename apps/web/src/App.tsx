import { useEffect, useState, type ReactNode } from "react";
import type { Day, DayItem } from "@visitrip/shared";
import { Icon } from "./components/Icon";
import { TabBar } from "./components/ui";
import { AuthProvider, useAuth } from "./lib/auth";
import { useTrip } from "./lib/trips";
import { api } from "./lib/api";
import { TripDocProvider } from "./lib/yjs";
import { ForgotPassword, SignIn, SignUp } from "./screens/auth";
import { TripsScreen } from "./screens/trips";
import { TripScreen } from "./screens/trip";
import { DayScreen } from "./screens/day";
import { PlaceSheet } from "./screens/place";
import { InviteSheet } from "./screens/invite";
import { InviteAcceptScreen } from "./screens/inviteAccept";
import { NewTripSheet } from "./screens/newtrip";
import { ProfileScreen } from "./screens/profile";
import { TripSettingsSheet } from "./screens/tripsettings";

const PENDING_INVITE_KEY = "visitrip:pendingInvite";

function readInviteFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const m = window.location.pathname.match(/^\/invite\/([A-Za-z0-9_-]{8,})\/?$/);
  if (m) {
    sessionStorage.setItem(PENDING_INVITE_KEY, m[1]!);
    window.history.replaceState({}, "", "/");
    return m[1]!;
  }
  return sessionStorage.getItem(PENDING_INVITE_KEY);
}

function clearPendingInvite() {
  sessionStorage.removeItem(PENDING_INVITE_KEY);
}

type Route =
  | { screen: "home" }
  | { screen: "trip"; tripId: string }
  | { screen: "day"; tripId: string; dayId: string }
  | { screen: "profile" };

type SheetState =
  | { kind: "place"; item: DayItem }
  | { kind: "invite"; tripId: string }
  | { kind: "newtrip" }
  | { kind: "tripSettings"; tripId: string }
  | null;

const TABS: Array<{ id: string; icon: string; label: string }> = [
  { id: "trips", icon: "trips", label: "Trips" },
  { id: "map", icon: "map", label: "Discover" },
  { id: "inbox", icon: "inbox", label: "Inbox" },
  { id: "profile", icon: "user", label: "You" },
];

export function App() {
  return (
    <AuthProvider>
      <Frame>
        <RoutedApp />
      </Frame>
    </AuthProvider>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="vt-frame">
      <div className="vt-frame__inner" data-theme="light">
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "var(--vt-bg)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function RoutedApp() {
  const { state } = useAuth();
  const [pendingInvite, setPendingInvite] = useState<string | null>(() => readInviteFromUrl());
  const [acceptMode, setAcceptMode] = useState<"preview" | "auth">("preview");
  const [openTripOnReady, setOpenTripOnReady] = useState<string | null>(null);

  const clearInvite = () => {
    clearPendingInvite();
    setPendingInvite(null);
    setAcceptMode("preview");
  };

  useEffect(() => {
    if (state.status === "anon" && acceptMode === "auth" && !pendingInvite) {
      setAcceptMode("preview");
    }
    if (state.status === "authed" && acceptMode === "auth" && pendingInvite) {
      setAcceptMode("preview");
    }
  }, [state.status, acceptMode, pendingInvite]);

  if (state.status === "loading") return <LoadingScreen />;

  if (pendingInvite && acceptMode === "preview") {
    return (
      <InviteAcceptScreen
        token={pendingInvite}
        onCancel={clearInvite}
        onSignInRequired={() => setAcceptMode("auth")}
        onJoined={(tripId) => {
          clearPendingInvite();
          setPendingInvite(null);
          setAcceptMode("preview");
          setOpenTripOnReady(tripId);
        }}
      />
    );
  }

  if (state.status === "anon") {
    return <AuthFlow inviteBanner={!!pendingInvite} />;
  }

  return <SignedInApp initialTripId={openTripOnReady} onConsumedInitialTrip={() => setOpenTripOnReady(null)} />;
}

function LoadingScreen() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--vt-label-tertiary)",
        fontSize: 14,
      }}
    >
      Loading…
    </div>
  );
}

function AuthFlow({ inviteBanner = false }: { inviteBanner?: boolean }) {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(inviteBanner ? "signup" : "signin");
  if (mode === "forgot") return <ForgotPassword onBack={() => setMode("signin")} />;
  return mode === "signin" ? (
    <SignIn
      onSwitch={() => setMode("signup")}
      onForgot={() => setMode("forgot")}
      inviteBanner={inviteBanner}
    />
  ) : (
    <SignUp onSwitch={() => setMode("signin")} inviteBanner={inviteBanner} />
  );
}

interface SignedInAppProps {
  initialTripId?: string | null;
  onConsumedInitialTrip?: () => void;
}

function SignedInApp({ initialTripId, onConsumedInitialTrip }: SignedInAppProps = {}) {
  const [route, setRoute] = useState<Route>(
    initialTripId ? { screen: "trip", tripId: initialTripId } : { screen: "home" },
  );
  useEffect(() => {
    if (initialTripId && route.screen !== "trip") {
      setRoute({ screen: "trip", tripId: initialTripId });
    }
    if (initialTripId) onConsumedInitialTrip?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTripId]);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [tab, setTab] = useState("trips");
  const [toast, setToast] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const handleTab = (next: string) => {
    setTab(next);
    if (next === "trips") setRoute({ screen: "home" });
    else if (next === "profile") setRoute({ screen: "profile" });
    else if (next === "map") showToast("Discover (coming soon)");
    else if (next === "inbox") showToast("Inbox (coming soon)");
  };

  const hasTabBar = route.screen === "home" || route.screen === "profile";

  return (
    <>
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        {route.screen === "home" && (
          <TripsScreen
            key={refreshKey}
            onOpen={(id) => setRoute({ screen: "trip", tripId: id })}
            onNew={() => setSheet({ kind: "newtrip" })}
          />
        )}
        {route.screen === "trip" && (
          <TripView
            tripId={route.tripId}
            onBack={() => setRoute({ screen: "home" })}
            onOpenDay={(day) => setRoute({ screen: "day", tripId: route.tripId, dayId: day.id })}
            onShare={() => setSheet({ kind: "invite", tripId: route.tripId })}
            onOpenSettings={() => setSheet({ kind: "tripSettings", tripId: route.tripId })}
          />
        )}
        {route.screen === "day" && (
          <DayView
            tripId={route.tripId}
            dayId={route.dayId}
            onBack={() => setRoute({ screen: "trip", tripId: route.tripId })}
            onOpenPlace={(item) => setSheet({ kind: "place", item })}
          />
        )}
        {route.screen === "profile" && (
          <ProfileScreen
            onBack={() => {
              setTab("trips");
              setRoute({ screen: "home" });
            }}
          />
        )}
      </div>

      {hasTabBar && <TabBar value={tab} onChange={handleTab} items={TABS} />}

      {sheet?.kind === "place" && <PlaceSheet item={sheet.item} onClose={() => setSheet(null)} />}
      {sheet?.kind === "invite" && (
        <InviteSheetWrapper tripId={sheet.tripId} onClose={() => setSheet(null)} />
      )}
      {sheet?.kind === "tripSettings" && (
        <TripSettingsSheetWrapper
          tripId={sheet.tripId}
          onClose={() => setSheet(null)}
          onDeleted={() => {
            setSheet(null);
            setRoute({ screen: "home" });
            setRefreshKey((k) => k + 1);
            showToast("Trip deleted");
          }}
        />
      )}
      {sheet?.kind === "newtrip" && (
        <NewTripSheet
          onClose={() => setSheet(null)}
          onCreate={async (input) => {
            await api.createTrip(input);
            setSheet(null);
            setRefreshKey((k) => k + 1);
            showToast("Trip created");
          }}
        />
      )}

      {toast && (
        <div className="vt-toast">
          <Icon name="check" size={16} /> {toast}
        </div>
      )}
    </>
  );
}

interface TripViewProps {
  tripId: string;
  onBack: () => void;
  onOpenDay: (day: Day) => void;
  onShare: () => void;
  onOpenSettings: () => void;
}

function TripView({ tripId, onBack, onOpenDay, onShare, onOpenSettings }: TripViewProps) {
  const { state } = useAuth();
  const { trip, loading, error, refresh } = useTrip(tripId);
  if (loading && !trip) return <LoadingScreen />;
  if (error || !trip) {
    return (
      <CenteredMessage>
        {error ?? "Trip not found"}
      </CenteredMessage>
    );
  }
  if (state.status !== "authed") return null;
  return (
    <TripDocProvider key={tripId} tripId={tripId} user={state.user}>
      <TripScreen
        trip={trip}
        onBack={onBack}
        onOpenDay={onOpenDay}
        onShare={onShare}
        onOpenSettings={onOpenSettings}
        refresh={refresh}
      />
    </TripDocProvider>
  );
}

interface DayViewProps {
  tripId: string;
  dayId: string;
  onBack: () => void;
  onOpenPlace: (item: DayItem) => void;
}

function DayView({ tripId, dayId, onBack, onOpenPlace }: DayViewProps) {
  const { trip, loading, refresh } = useTrip(tripId);
  if (loading && !trip) return <LoadingScreen />;
  if (!trip) return <CenteredMessage>Trip not found</CenteredMessage>;
  const day = trip.days.find((d) => d.id === dayId);
  if (!day) return <CenteredMessage>Day not found</CenteredMessage>;
  return <DayScreen trip={trip} day={day} onBack={onBack} onOpenPlace={onOpenPlace} refresh={refresh} />;
}

function InviteSheetWrapper({ tripId, onClose }: { tripId: string; onClose: () => void }) {
  const { trip } = useTrip(tripId);
  if (!trip) return null;
  return <InviteSheet trip={trip} onClose={onClose} />;
}

interface TripSettingsWrapperProps {
  tripId: string;
  onClose: () => void;
  onDeleted: () => void;
}

function TripSettingsSheetWrapper({ tripId, onClose, onDeleted }: TripSettingsWrapperProps) {
  const { trip, refresh } = useTrip(tripId);
  if (!trip) return null;
  return (
    <TripSettingsSheet
      trip={trip}
      onClose={onClose}
      onChanged={refresh}
      onDeleted={onDeleted}
    />
  );
}

function CenteredMessage({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        textAlign: "center",
        color: "var(--vt-label-tertiary)",
        fontSize: 14,
      }}
    >
      {children}
    </div>
  );
}
