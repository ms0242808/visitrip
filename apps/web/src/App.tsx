import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { TripDetail, User } from "@visitrip/shared";
import { AuthProvider, useAuth } from "./lib/auth";
import { api } from "./lib/api";
import { useTrip, useTrips } from "./lib/trips";
import { TripDocProvider } from "./lib/yjs";
import { adaptTripDetail, buildDirectory } from "./lib/adapters";
import { ForgotPassword, SignIn, SignUp } from "./screens/auth";
import { TripsHome } from "./screens/trips";
import { ActivityScreen } from "./screens/activity";
import { YouScreen } from "./screens/you";
import { TripOverview, type PlanSub, type TripQuickAction } from "./screens/trip";
import { MapView } from "./screens/map";
import { Expenses } from "./screens/expenses";
import { Documents } from "./screens/documents";
import { InviteModal, NewTripModal, type NewTripValues } from "./screens/modals";
import { DesktopShell } from "./screens/desktop";
import { InviteAcceptScreen } from "./screens/inviteAccept";
import { ROOT_TABS, StatusBar, TRIP_TABS, TabBar } from "./components/ui";

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

  return (
    <SignedInApp
      user={state.user}
      initialTripId={openTripOnReady}
      onConsumedInitialTrip={() => setOpenTripOnReady(null)}
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
  user: User;
  initialTripId?: string | null;
  onConsumedInitialTrip?: () => void;
}

function SignedInApp({ user, initialTripId, onConsumedInitialTrip }: SignedInAppProps) {
  const vw = useViewport();
  const isDesktop = vw >= 900;

  if (isDesktop) {
    return (
      <DesktopShell
        user={user}
        initialTripId={initialTripId}
        onConsumedInitialTrip={onConsumedInitialTrip}
      />
    );
  }
  return (
    <PhoneShell
      user={user}
      initialTripId={initialTripId}
      onConsumedInitialTrip={onConsumedInitialTrip}
    />
  );
}

function PhoneShell({
  user,
  initialTripId,
  onConsumedInitialTrip,
}: {
  user: User;
  initialTripId?: string | null;
  onConsumedInitialTrip?: () => void;
}) {
  const [rootTab, setRootTab] = useState<"trips" | "activity" | "you">("trips");
  const [tripId, setTripId] = useState<string | null>(initialTripId ?? null);
  const [tripTab, setTripTab] = useState<"plan" | "map" | "money" | "docs">("plan");
  const [planSub, setPlanSub] = useState<PlanSub>("overview");
  const [showNewTrip, setShowNewTrip] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const tripsResult = useTrips(refreshKey);

  useEffect(() => {
    if (initialTripId) {
      setTripId(initialTripId);
      setTripTab("plan");
      setPlanSub("overview");
      onConsumedInitialTrip?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTripId]);

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

  const onCreateTrip = useCallback(async (values: NewTripValues) => {
    const { id } = await api.createTrip(values);
    setRefreshKey((k) => k + 1);
    setShowNewTrip(false);
    setTripId(id);
    setTripTab("plan");
    setPlanSub("overview");
  }, []);

  const activeBackendTrip = tripsResult.trips?.find((t) => t.id === tripId) ?? null;

  let screen: ReactNode = null;
  if (!tripId) {
    if (rootTab === "trips")
      screen = (
        <TripsHome
          tripsResult={tripsResult}
          user={user}
          onOpenTrip={openTrip}
          onNewTrip={() => setShowNewTrip(true)}
        />
      );
    if (rootTab === "activity") screen = <ActivityScreen />;
    if (rootTab === "you") screen = <YouScreen user={user} />;
  } else {
    screen = (
      <TripView
        tripId={tripId}
        user={user}
        tripTab={tripTab}
        setTripTab={setTripTab}
        planSub={planSub}
        setPlanSub={setPlanSub}
        onBack={exitTrip}
        onInvite={() => setShowInvite(true)}
        onTripQuickAction={onTripQuickAction}
      />
    );
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
              tabs={tripId ? TRIP_TABS : ROOT_TABS}
              active={tripId ? tripTab : rootTab}
              onTab={(id) => {
                if (tripId) setTripTab(id as typeof tripTab);
                else setRootTab(id as typeof rootTab);
              }}
              trip={
                tripId && activeBackendTrip
                  ? { name: activeBackendTrip.title, cover: activeBackendTrip.cover }
                  : null
              }
              onExitTrip={exitTrip}
            />
          </div>
          <NewTripModal
            open={showNewTrip}
            onClose={() => setShowNewTrip(false)}
            onCreate={onCreateTrip}
          />
          <InviteModal
            open={showInvite}
            onClose={() => setShowInvite(false)}
            tripId={tripId}
          />
          <span className="home-ind" />
        </div>
      </div>
    </>
  );
}

interface TripViewProps {
  tripId: string;
  user: User;
  tripTab: "plan" | "map" | "money" | "docs";
  setTripTab: (tab: "plan" | "map" | "money" | "docs") => void;
  planSub: PlanSub;
  setPlanSub: (sub: PlanSub) => void;
  onBack: () => void;
  onInvite: () => void;
  onTripQuickAction: (sub: TripQuickAction) => void;
}

export function TripView({
  tripId,
  user,
  tripTab,
  setTripTab,
  planSub,
  setPlanSub,
  onBack,
  onInvite,
  onTripQuickAction,
}: TripViewProps) {
  const { trip: detail, loading, refresh } = useTrip(tripId);

  if (loading && !detail) {
    return <LoadingScreen />;
  }
  if (!detail) {
    return (
      <div
        style={{
          flex: 1,
          padding: "40px 24px",
          textAlign: "center",
          color: "var(--c-ink-3)",
        }}
      >
        Trip not found.
      </div>
    );
  }

  return (
    <TripDocProvider tripId={tripId} user={user}>
      <TripContent
        detail={detail}
        user={user}
        tripTab={tripTab}
        planSub={planSub}
        setPlanSub={setPlanSub}
        setTripTab={setTripTab}
        onBack={onBack}
        onInvite={onInvite}
        onTripQuickAction={onTripQuickAction}
        refresh={refresh}
      />
    </TripDocProvider>
  );
}

interface TripContentProps {
  detail: TripDetail;
  user: User;
  tripTab: "plan" | "map" | "money" | "docs";
  setTripTab: (tab: "plan" | "map" | "money" | "docs") => void;
  planSub: PlanSub;
  setPlanSub: (sub: PlanSub) => void;
  onBack: () => void;
  onInvite: () => void;
  onTripQuickAction: (sub: TripQuickAction) => void;
  refresh: () => Promise<void>;
}

function TripContent({
  detail,
  user,
  tripTab,
  setTripTab,
  planSub,
  setPlanSub,
  onBack,
  onInvite,
  onTripQuickAction,
  refresh,
}: TripContentProps) {
  const directory = buildDirectory(detail.members, user);
  const trip = adaptTripDetail(detail);

  if (tripTab === "plan") {
    return (
      <TripOverview
        trip={trip}
        detail={detail}
        directory={directory}
        onBack={onBack}
        onSubScreen={onTripQuickAction}
        onInvite={onInvite}
        sub={planSub}
        setSub={setPlanSub}
        refresh={refresh}
      />
    );
  }
  if (tripTab === "map") return <MapView onBack={() => setTripTab("plan")} />;
  if (tripTab === "money")
    return (
      <Expenses
        detail={detail}
        directory={directory}
        onBack={() => setTripTab("plan")}
        refresh={refresh}
      />
    );
  if (tripTab === "docs")
    return (
      <Documents detail={detail} directory={directory} onBack={() => setTripTab("plan")} />
    );
  return null;
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
