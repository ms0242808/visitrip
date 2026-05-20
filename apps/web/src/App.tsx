import { useEffect, useState, type ReactNode } from "react";
import { AuthProvider, useAuth } from "./lib/auth";
import { ForgotPassword, SignIn, SignUp } from "./screens/auth";
import { TripsHome } from "./screens/trips";
import { ActivityScreen } from "./screens/activity";
import { YouScreen } from "./screens/you";
import { TripOverview, type PlanSub, type TripQuickAction } from "./screens/trip";
import { MapView } from "./screens/map";
import { Expenses } from "./screens/expenses";
import { Documents } from "./screens/documents";
import { InviteModal, NewTripModal } from "./screens/modals";
import { DesktopShell } from "./screens/desktop";
import { ROOT_TABS, StatusBar, TRIP_TABS, TabBar } from "./components/ui";
import { TRIPS } from "./lib/data";

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

export function App() {
  return (
    <AuthProvider>
      <RoutedApp />
    </AuthProvider>
  );
}

function useViewport() {
  const [w, setW] = useState(typeof window === "undefined" ? 1200 : window.innerWidth);
  useEffect(() => {
    const onR = () => setW(window.innerWidth);
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);
  return w;
}

function RoutedApp() {
  const { state } = useAuth();
  const [pendingInvite, setPendingInvite] = useState<string | null>(() => readInviteFromUrl());

  if (state.status === "loading") {
    return <LoadingScreen />;
  }
  if (state.status === "anon") {
    return <AuthFlow inviteBanner={!!pendingInvite} />;
  }

  return (
    <SignedInApp
      pendingInvite={pendingInvite}
      onInviteConsumed={() => {
        clearPendingInvite();
        setPendingInvite(null);
      }}
    />
  );
}

function LoadingScreen() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--c-ink-3)",
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
  pendingInvite: string | null;
  onInviteConsumed: () => void;
}

function SignedInApp(_props: SignedInAppProps) {
  const vw = useViewport();
  const isDesktop = vw >= 900;

  if (isDesktop) {
    return <DesktopShell />;
  }

  return <PhoneShell />;
}

function PhoneShell() {
  const [rootTab, setRootTab] = useState<"trips" | "activity" | "you">("trips");
  const [tripId, setTripId] = useState<string | null>(null);
  const [tripTab, setTripTab] = useState<"plan" | "map" | "money" | "docs">("plan");
  const [planSub, setPlanSub] = useState<PlanSub>("overview");
  const [showNewTrip, setShowNewTrip] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const trip = tripId ? TRIPS.find((t) => t.id === tripId) ?? null : null;

  const openTrip = (id: string) => {
    setTripId(id);
    setTripTab("plan");
    setPlanSub("overview");
  };
  const exitTrip = () => setTripId(null);

  const onTripQuickAction = (sub: TripQuickAction) => {
    if (sub === "invite") setShowInvite(true);
    else if (sub === "map") setTripTab("map");
    else if (sub === "expenses") setTripTab("money");
    else if (sub === "docs") setTripTab("docs");
  };

  let screen: ReactNode = null;
  if (!trip) {
    if (rootTab === "trips")
      screen = <TripsHome onOpenTrip={openTrip} onNewTrip={() => setShowNewTrip(true)} />;
    if (rootTab === "activity") screen = <ActivityScreen />;
    if (rootTab === "you") screen = <YouScreen />;
  } else {
    if (tripTab === "plan")
      screen = (
        <TripOverview
          trip={trip}
          onBack={exitTrip}
          onSubScreen={onTripQuickAction}
          onInvite={() => setShowInvite(true)}
          sub={planSub}
          setSub={setPlanSub}
        />
      );
    if (tripTab === "map") screen = <MapView onBack={() => setTripTab("plan")} />;
    if (tripTab === "money") screen = <Expenses onBack={() => setTripTab("plan")} />;
    if (tripTab === "docs") screen = <Documents onBack={() => setTripTab("plan")} />;
  }

  return (
    <>
      <SideHint />
      <div className="stage">
        <div className="device">
          <span className="island" />
          <StatusBar />
          <div className="screen">
            <div className="scroll">{screen}</div>
            <TabBar
              tabs={trip ? TRIP_TABS : ROOT_TABS}
              active={trip ? tripTab : rootTab}
              onTab={(id) => {
                if (trip) setTripTab(id as typeof tripTab);
                else setRootTab(id as typeof rootTab);
              }}
              trip={trip}
              onExitTrip={exitTrip}
            />
          </div>
          <NewTripModal open={showNewTrip} onClose={() => setShowNewTrip(false)} />
          <InviteModal open={showInvite} onClose={() => setShowInvite(false)} />
          <span className="home-ind" />
        </div>
      </div>
    </>
  );
}

function SideHint() {
  return (
    <div className="side-hint">
      <span style={{ fontStyle: "italic" }}>Trip</span> — plan together.
      <br />
      <span
        style={{
          fontSize: 13,
          color: "var(--c-ink-4)",
          display: "block",
          marginTop: 8,
          fontFamily: "var(--sf-ui)",
        }}
      >
        Tabs at the bottom switch between Trips / Activity / You.
        <br />
        Open any trip to see its Plan / Map / Money / Docs.
      </span>
    </div>
  );
}
