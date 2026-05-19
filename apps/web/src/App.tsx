import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Day, DayItem, TripSummary } from "@visitrip/shared";
import { Avatar } from "./components/Avatar";
import { Icon } from "./components/Icon";
import { IconButton, TabBar } from "./components/ui";
import { AuthProvider, useAuth } from "./lib/auth";
import { useTrip, useTrips } from "./lib/trips";
import { api } from "./lib/api";
import { TripDocProvider } from "./lib/yjs";
import { ForgotPassword, SignIn, SignUp } from "./screens/auth";
import { TripsScreen } from "./screens/trips";
import { TripScreen } from "./screens/trip";
import { DayScreen } from "./screens/day";
import { PlaceSheet } from "./screens/place";
import { InviteSheet } from "./screens/invite";
import { InviteAcceptScreen } from "./screens/inviteAccept";
import { NewTripScreen } from "./screens/newtrip";
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
  | { screen: "newtrip" }
  | { screen: "trip"; tripId: string }
  | { screen: "day"; tripId: string; dayId: string }
  | { screen: "profile" };

type SheetState =
  | { kind: "place"; item: DayItem }
  | { kind: "invite"; tripId: string }
  | { kind: "tripSettings"; tripId: string }
  | null;

const TABS: Array<{ id: string; icon: string; label: string; featured?: boolean }> = [
  { id: "trips", icon: "trips", label: "Trips" },
  { id: "newtrip", icon: "plus", label: "New trip", featured: true },
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
      <div className="vt-frame__inner">{children}</div>
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

  if (state.status === "loading") {
    return (
      <div className="vt-content-root">
        <LoadingScreen />
      </div>
    );
  }

  if (pendingInvite && acceptMode === "preview") {
    return (
      <div className="vt-content-root">
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
      </div>
    );
  }

  if (state.status === "anon") {
    return (
      <div className="vt-content-root">
        <AuthFlow inviteBanner={!!pendingInvite} />
      </div>
    );
  }

  return (
    <SignedInApp
      initialTripId={openTripOnReady}
      onConsumedInitialTrip={() => setOpenTripOnReady(null)}
    />
  );
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
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(
    inviteBanner ? "signup" : "signin",
  );
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
  const [toast, setToast] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const tabValue = useMemo(() => {
    if (route.screen === "newtrip") return "newtrip";
    if (route.screen === "profile") return "profile";
    return "trips";
  }, [route.screen]);

  const handleTab = (next: string) => {
    if (next === "trips") setRoute({ screen: "home" });
    else if (next === "newtrip") setRoute({ screen: "newtrip" });
    else if (next === "profile") setRoute({ screen: "profile" });
  };

  const hasTabBar =
    route.screen === "home" || route.screen === "profile" || route.screen === "newtrip";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n" && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        setRoute({ screen: "newtrip" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Sidebar
        route={route}
        onGoHome={() => setRoute({ screen: "home" })}
        onGoNewTrip={() => setRoute({ screen: "newtrip" })}
        onGoProfile={() => setRoute({ screen: "profile" })}
        onOpenTrip={(id) => setRoute({ screen: "trip", tripId: id })}
        refreshKey={refreshKey}
      />

      <div className="vt-content-root">
        <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
          {route.screen === "home" && (
            <TripsScreen
              key={refreshKey}
              onOpen={(id) => setRoute({ screen: "trip", tripId: id })}
              onNew={() => setRoute({ screen: "newtrip" })}
            />
          )}
          {route.screen === "newtrip" && (
            <NewTripScreen
              onCancel={() => setRoute({ screen: "home" })}
              onCreate={async (input, options) => {
                const created = await api.createTrip(input);
                setRefreshKey((k) => k + 1);
                setRoute({ screen: "trip", tripId: created.id });
                if (options?.openInvite) {
                  setSheet({ kind: "invite", tripId: created.id });
                }
                showToast("Trip created");
              }}
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
                setRoute({ screen: "home" });
              }}
            />
          )}
        </div>

        {hasTabBar && (
          <div className="vt-tabbar-root">
            <TabBar value={tabValue} onChange={handleTab} items={TABS} />
          </div>
        )}
      </div>

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

      {toast && (
        <div className="vt-toast">
          <Icon name="check" size={16} /> {toast}
        </div>
      )}
    </>
  );
}

interface SidebarProps {
  route: Route;
  onGoHome: () => void;
  onGoNewTrip: () => void;
  onGoProfile: () => void;
  onOpenTrip: (id: string) => void;
  refreshKey: number;
}

function Sidebar({ route, onGoHome, onGoNewTrip, onGoProfile, onOpenTrip, refreshKey }: SidebarProps) {
  const { state } = useAuth();
  const { trips } = useTrips(refreshKey);
  const me = state.user;
  const [query, setQuery] = useState("");

  const activeTripId = route.screen === "trip" || route.screen === "day" ? route.tripId : null;
  const isHome = route.screen === "home";
  const isNewTrip = route.screen === "newtrip";
  const isProfile = route.screen === "profile";

  const now = new Date();
  const all = trips ?? [];
  const matchQuery = (t: TripSummary) =>
    query.trim().length === 0 ||
    `${t.title} ${t.location}`.toLowerCase().includes(query.trim().toLowerCase());
  const upcoming = all.filter((t) => !t.archived && new Date(t.endDate) >= now).filter(matchQuery);
  const past = all.filter((t) => t.archived || new Date(t.endDate) < now).filter(matchQuery);

  return (
    <aside className="vt-sidebar-root" aria-label="Sidebar">
      <div className="vt-sb-brand">
        <span className="vt-sb-brand-mark">
          <Icon name="logo" size={15} />
        </span>
        <span className="vt-sb-brand-name">Visitrip</span>
      </div>

      <label className="vt-sb-search">
        <Icon name="search" size={14} />
        <input
          type="search"
          placeholder="Search trips"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query.length === 0 && <kbd>⌘K</kbd>}
      </label>

      <nav
        className="vt-sidebar"
        style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: 10 }}
      >
        <SidebarLink
          icon="trips"
          label="All trips"
          active={isHome}
          onClick={onGoHome}
        />
        <SidebarLink
          icon="plus"
          label="New trip"
          shortcut="⌘N"
          accent
          active={isNewTrip}
          onClick={onGoNewTrip}
        />
        <SidebarLink icon="user" label="You" active={isProfile} onClick={onGoProfile} />

        {upcoming.length > 0 && (
          <div className="vt-sb-section">Upcoming · {upcoming.length}</div>
        )}
        {upcoming.map((t) => (
          <SidebarTripLink
            key={t.id}
            trip={t}
            active={activeTripId === t.id}
            onClick={() => onOpenTrip(t.id)}
          />
        ))}

        {past.length > 0 && <div className="vt-sb-section">Past · {past.length}</div>}
        {past.map((t) => (
          <SidebarTripLink
            key={t.id}
            trip={t}
            active={activeTripId === t.id}
            onClick={() => onOpenTrip(t.id)}
          />
        ))}
      </nav>

      {me && (
        <div className="vt-sb-foot">
          <Avatar name={me.name} size={28} />
          <div className="vt-sb-foot__meta">
            <div className="vt-sb-foot__name vt-truncate">{me.name}</div>
            <div className="vt-sb-foot__sub vt-truncate">Synced · just now</div>
          </div>
          <IconButton name="user" onClick={onGoProfile} aria-label="Profile settings" />
        </div>
      )}
    </aside>
  );
}

interface SidebarLinkProps {
  icon: string;
  label: string;
  active?: boolean;
  shortcut?: string;
  accent?: boolean;
  onClick: () => void;
}

function SidebarLink({ icon, label, active, shortcut, accent, onClick }: SidebarLinkProps) {
  return (
    <a
      role="button"
      tabIndex={0}
      aria-current={active ? "true" : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      style={accent && !active ? { color: "var(--vt-accent)" } : undefined}
    >
      <span className="vt-sb-ico" style={accent && !active ? { color: "var(--vt-accent)" } : undefined}>
        <Icon name={icon} size={18} strokeWidth={accent ? 2 : 1.7} />
      </span>
      {label}
      {shortcut && (
        <span
          style={{
            marginLeft: "auto",
            fontSize: 10,
            fontFamily: "ui-monospace, monospace",
            color: "var(--vt-label-quaternary)",
          }}
        >
          {shortcut}
        </span>
      )}
    </a>
  );
}

function SidebarTripLink({
  trip,
  active,
  onClick,
}: {
  trip: TripSummary;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <a
      role="button"
      tabIndex={0}
      aria-current={active ? "true" : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: 5,
          background: coverColor(trip.cover),
          display: "inline-block",
          flexShrink: 0,
          boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.08)",
        }}
      />
      <span className="vt-truncate" style={{ flex: 1, minWidth: 0 }}>
        {trip.title}
      </span>
    </a>
  );
}

const COVER_SWATCH: Record<string, string> = {
  "cover-lisbon": "oklch(60% 0.16 35)",
  "cover-hokkaido": "oklch(60% 0.10 240)",
  "cover-coast": "oklch(55% 0.13 220)",
  "cover-alps": "oklch(60% 0.06 245)",
  "cover-desert": "oklch(64% 0.14 60)",
  "cover-cdmx": "oklch(60% 0.12 100)",
};

function coverColor(kind: string): string {
  return COVER_SWATCH[kind] ?? "var(--vt-fill-tertiary)";
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
    return <CenteredMessage>{error ?? "Trip not found"}</CenteredMessage>;
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
