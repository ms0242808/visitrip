import { useState, type ReactNode } from "react";
import type { Day, DayItem } from "@visitrip/shared";
import { Icon } from "./components/Icon";
import { TabBar } from "./components/ui";
import { AuthProvider, useAuth } from "./lib/auth";
import { useTrip } from "./lib/trips";
import { api } from "./lib/api";
import { TripDocProvider } from "./lib/yjs";
import { SignIn, SignUp } from "./screens/auth";
import { TripsScreen } from "./screens/trips";
import { TripScreen } from "./screens/trip";
import { DayScreen } from "./screens/day";
import { PlaceSheet } from "./screens/place";
import { InviteSheet } from "./screens/invite";
import { NewTripSheet } from "./screens/newtrip";
import { ProfileScreen } from "./screens/profile";

type Route =
  | { screen: "home" }
  | { screen: "trip"; tripId: string }
  | { screen: "day"; tripId: string; dayId: string }
  | { screen: "profile" };

type SheetState =
  | { kind: "place"; item: DayItem }
  | { kind: "invite"; tripId: string }
  | { kind: "newtrip" }
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

  if (state.status === "loading") return <LoadingScreen />;
  if (state.status === "anon") return <AuthFlow />;
  return <SignedInApp />;
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

function AuthFlow() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  return mode === "signin" ? (
    <SignIn onSwitch={() => setMode("signup")} onForgot={() => {}} />
  ) : (
    <SignUp onSwitch={() => setMode("signin")} />
  );
}

function SignedInApp() {
  const [route, setRoute] = useState<Route>({ screen: "home" });
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
            onOpenSettings={() => showToast("Trip settings (coming soon)")}
          />
        )}
        {route.screen === "day" && (
          <DayView
            tripId={route.tripId}
            dayId={route.dayId}
            onBack={() => setRoute({ screen: "trip", tripId: route.tripId })}
            onOpenPlace={(item) => setSheet({ kind: "place", item })}
            onAdd={() => showToast("Add a plan (coming soon)")}
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
  const { trip, loading, error } = useTrip(tripId);
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
    <TripDocProvider tripId={tripId} user={state.user}>
      <TripScreen
        trip={trip}
        onBack={onBack}
        onOpenDay={onOpenDay}
        onShare={onShare}
        onOpenSettings={onOpenSettings}
      />
    </TripDocProvider>
  );
}

interface DayViewProps {
  tripId: string;
  dayId: string;
  onBack: () => void;
  onOpenPlace: (item: DayItem) => void;
  onAdd: () => void;
}

function DayView({ tripId, dayId, onBack, onOpenPlace, onAdd }: DayViewProps) {
  const { trip, loading } = useTrip(tripId);
  if (loading && !trip) return <LoadingScreen />;
  if (!trip) return <CenteredMessage>Trip not found</CenteredMessage>;
  const day = trip.days.find((d) => d.id === dayId);
  if (!day) return <CenteredMessage>Day not found</CenteredMessage>;
  return <DayScreen trip={trip} day={day} onBack={onBack} onOpenPlace={onOpenPlace} onAdd={onAdd} />;
}

function InviteSheetWrapper({ tripId, onClose }: { tripId: string; onClose: () => void }) {
  const { trip } = useTrip(tripId);
  if (!trip) return null;
  return <InviteSheet trip={trip} onClose={onClose} />;
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
