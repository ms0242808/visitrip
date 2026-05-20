import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { TripDetail, User } from "@visitrip/shared";
import { Icon, type IconName } from "../components/Icon";
import { Avatar, AvatarStack } from "../components/Avatar";
import {
  PresenceCursor,
  Typing,
  useDriftingCursors,
} from "../components/ui";
import { adaptTripDetail, adaptTripSummary, buildDirectory, hueFor, initialsFor, type MemberDirectory } from "../lib/adapters";
import { api } from "../lib/api";
import { useTrip, useTrips } from "../lib/trips";
import { TripDocProvider } from "../lib/yjs";
import { Itinerary } from "./itinerary";
import { Checklist } from "./checklist";
import { Polls } from "./polls";
import { MapView } from "./map";
import { Expenses } from "./expenses";
import { Documents } from "./documents";
import { ActivityRow, ActivityScreen } from "./activity";
import { useActivity } from "../lib/activity";
import { YouScreen } from "./you";
import { InviteModal, NewTripModal, type NewTripValues } from "./modals";

type DesktopRoot = "trips" | "activity" | "you";
type DesktopSectionId = "plan" | "map" | "money" | "documents";
type PlanSub = "overview" | "itinerary" | "checklist" | "polls";

const TRIP_SECTIONS: { id: DesktopSectionId; label: string; icon: IconName }[] = [
  { id: "plan", label: "Plan", icon: "list" },
  { id: "map", label: "Map", icon: "map" },
  { id: "money", label: "Money", icon: "cash" },
  { id: "documents", label: "Documents", icon: "doc" },
];

interface DesktopShellProps {
  user: User;
  initialTripId?: string | null;
  onConsumedInitialTrip?: () => void;
}

export function DesktopShell({ user, initialTripId, onConsumedInitialTrip }: DesktopShellProps) {
  const [tripId, setTripId] = useState<string | null>(initialTripId ?? null);
  const [section, setSection] = useState<DesktopSectionId>("plan");
  const [planSub, setPlanSub] = useState<PlanSub>("overview");
  const [rootView, setRootView] = useState<DesktopRoot>("trips");
  const [showNewTrip, setShowNewTrip] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const tripsResult = useTrips(refreshKey);

  useEffect(() => {
    if (initialTripId) {
      setTripId(initialTripId);
      setSection("plan");
      setPlanSub("overview");
      onConsumedInitialTrip?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTripId]);

  const openTrip = useCallback((id: string) => {
    setTripId(id);
    setSection("plan");
    setPlanSub("overview");
  }, []);
  const exitTrip = useCallback(() => setTripId(null), []);

  const onCreateTrip = useCallback(async (values: NewTripValues) => {
    const { id } = await api.createTrip(values);
    setRefreshKey((k) => k + 1);
    setShowNewTrip(false);
    setTripId(id);
    setSection("plan");
    setPlanSub("overview");
  }, []);

  const adaptedSummaries = (tripsResult.trips ?? []).map(adaptTripSummary);
  const planning = adaptedSummaries.filter((t) => t.status === "planning").sort(
    (a, b) => a.daysAway - b.daysAway,
  );
  const past = adaptedSummaries.filter((t) => t.status === "past");

  return (
    <div className="desktop">
      <aside className="dsk-side">
        <div className="dsk-brand">
          <div className="mark">T</div>
          <div className="name">Trip</div>
        </div>
        <div className="scroll-pane">
          <div style={{ display: "grid", gap: 2, marginTop: 4 }}>
            <button
              className={`dsk-side-row ${!tripId && rootView === "trips" ? "active" : ""}`}
              onClick={() => {
                exitTrip();
                setRootView("trips");
              }}
            >
              <Icon name="home" size={16} style={{ width: 22 }} />
              <span style={{ flex: 1 }}>All trips</span>
              <span style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{planning.length}</span>
            </button>
            <button
              className={`dsk-side-row ${!tripId && rootView === "activity" ? "active" : ""}`}
              onClick={() => {
                exitTrip();
                setRootView("activity");
              }}
            >
              <Icon name="bell" size={16} style={{ width: 22 }} />
              <span style={{ flex: 1 }}>Activity</span>
            </button>
            <button
              className={`dsk-side-row ${!tripId && rootView === "you" ? "active" : ""}`}
              onClick={() => {
                exitTrip();
                setRootView("you");
              }}
            >
              <Icon name="settings" size={16} style={{ width: 22 }} />
              <span style={{ flex: 1 }}>You</span>
            </button>
          </div>

          <div className="dsk-side-label">Trips</div>
          <div style={{ display: "grid", gap: 2 }}>
            {planning.map((tt) => {
              const isOpen = tripId === tt.id;
              return (
                <Fragment key={tt.id}>
                  <button
                    className={`dsk-side-row ${isOpen ? "active" : ""}`}
                    onClick={() => openTrip(tt.id)}
                  >
                    <span className={`swatch ${tt.cover}`} />
                    <span
                      style={{
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tt.name}
                    </span>
                    {tt.daysAway > 0 && tt.daysAway < 30 && (
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          padding: "2px 6px",
                          background: isOpen ? "rgba(255,255,255,.18)" : "var(--c-tint)",
                          color: isOpen ? "inherit" : "var(--c-accent)",
                          borderRadius: 999,
                        }}
                      >
                        {tt.daysAway}d
                      </span>
                    )}
                  </button>
                  {isOpen && (
                    <div
                      style={{
                        display: "grid",
                        gap: 1,
                        marginLeft: 14,
                        paddingLeft: 12,
                        borderLeft: "0.5px solid var(--c-hair)",
                        marginBottom: 6,
                        marginTop: 2,
                      }}
                    >
                      {TRIP_SECTIONS.map((s) => (
                        <button
                          key={s.id}
                          className={`dsk-side-row ${section === s.id ? "active" : ""}`}
                          onClick={() => setSection(s.id)}
                          style={{ padding: "6px 10px" }}
                        >
                          <Icon name={s.icon} size={14} style={{ width: 18 }} />
                          <span style={{ flex: 1, fontSize: 13 }}>{s.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </Fragment>
              );
            })}
            <button
              className="dsk-side-row"
              onClick={() => setShowNewTrip(true)}
              style={{ color: "var(--c-ink-3)" }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  border: "1px dashed var(--c-ink-4)",
                  background: "transparent",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="plus" size={12} />
              </span>
              <span>New trip</span>
            </button>
          </div>

          {past.length > 0 && (
            <>
              <div className="dsk-side-label">Past</div>
              <div style={{ display: "grid", gap: 2 }}>
                {past.map((tt) => (
                  <button
                    key={tt.id}
                    className={`dsk-side-row ${tripId === tt.id ? "active" : ""}`}
                    onClick={() => openTrip(tt.id)}
                    style={{ opacity: 0.8 }}
                  >
                    <span className={`swatch ${tt.cover}`} />
                    <span
                      style={{
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tt.name}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={{ padding: "10px 14px 14px", borderTop: "0.5px solid var(--c-hair)" }}>
          <button
            className="dsk-side-row"
            onClick={() => {
              exitTrip();
              setRootView("you");
            }}
          >
            <Avatar
              user={{
                id: user.id,
                name: user.name || user.email,
                initials: initialsFor(user.name || user.email),
                hue: hueFor(user.id),
                online: true,
              }}
              size={26}
              showOnline
            />
            <div style={{ flex: 1, lineHeight: 1.2, textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{user.name || "You"}</div>
              <div style={{ fontSize: 11, color: "var(--c-ink-3)", fontWeight: 500 }}>
                {user.email}
              </div>
            </div>
            <Icon name="chev_r" size={14} style={{ color: "var(--c-ink-3)" }} />
          </button>
        </div>
      </aside>

      <main className="dsk-main">
        <div className="dsk-content">
          <div className="dsk-wrap">
            {!tripId && rootView === "trips" && (
              <DesktopAllTrips
                tripsResult={tripsResult}
                onOpenTrip={openTrip}
                onNewTrip={() => setShowNewTrip(true)}
              />
            )}
            {!tripId && rootView === "activity" && (
              <DesktopActivityWrap user={user} onOpenTrip={openTrip} />
            )}
            {!tripId && rootView === "you" && <YouScreen user={user} />}

            {tripId && (
              <DesktopTripView
                tripId={tripId}
                user={user}
                section={section}
                setSection={setSection}
                planSub={planSub}
                setPlanSub={setPlanSub}
                onExit={exitTrip}
                onInvite={() => setShowInvite(true)}
              />
            )}
          </div>
        </div>

        <NewTripModal open={showNewTrip} onClose={() => setShowNewTrip(false)} onCreate={onCreateTrip} />
        <InviteModal open={showInvite} onClose={() => setShowInvite(false)} tripId={tripId} />
      </main>
    </div>
  );
}

interface DesktopTripViewProps {
  tripId: string;
  user: User;
  section: DesktopSectionId;
  setSection: (s: DesktopSectionId) => void;
  planSub: PlanSub;
  setPlanSub: (s: PlanSub) => void;
  onExit: () => void;
  onInvite: () => void;
}

function DesktopTripView({
  tripId,
  user,
  section,
  setSection,
  planSub,
  setPlanSub,
  onExit,
  onInvite,
}: DesktopTripViewProps) {
  const { trip: detail, loading, refresh } = useTrip(tripId);

  if (loading && !detail) {
    return (
      <div style={{ padding: 40, color: "var(--c-ink-3)" }}>Loading…</div>
    );
  }
  if (!detail) {
    return <div style={{ padding: 40, color: "var(--c-ink-3)" }}>Trip not found.</div>;
  }

  return (
    <TripDocProvider key={tripId} tripId={tripId} user={user}>
      <DesktopTripBody
        detail={detail}
        user={user}
        section={section}
        setSection={setSection}
        planSub={planSub}
        setPlanSub={setPlanSub}
        onExit={onExit}
        onInvite={onInvite}
        refresh={refresh}
      />
    </TripDocProvider>
  );
}

interface DesktopTripBodyProps {
  detail: TripDetail;
  user: User;
  section: DesktopSectionId;
  setSection: (s: DesktopSectionId) => void;
  planSub: PlanSub;
  setPlanSub: (s: PlanSub) => void;
  onExit: () => void;
  onInvite: () => void;
  refresh: () => Promise<void>;
}

function DesktopTripBody({
  detail,
  user,
  section,
  setSection,
  planSub,
  setPlanSub,
  onExit,
  onInvite,
  refresh,
}: DesktopTripBodyProps) {
  const directory = buildDirectory(detail.members, user);
  const trip = adaptTripDetail(detail);
  const others = [...directory.byId.values()].filter((m) => m.id !== directory.me.id);
  const cursors = useDriftingCursors(others, [detail.id]);

  return (
    <>
      <DesktopTripTopBar
        title={detail.title}
        cover={trip.cover}
        dates={trip.dates}
        daysAway={trip.daysAway}
        memberCount={detail.members.length}
        directory={directory}
        onExit={onExit}
        onInvite={onInvite}
      />
      {section === "plan" && (
        <DesktopOverview
          detail={detail}
          trip={trip}
          directory={directory}
          cursors={cursors}
          onGoToSection={setSection}
          planSub={planSub}
          setPlanSub={setPlanSub}
          refresh={refresh}
        />
      )}
      {section === "map" && (
        <DesktopSection title="Map">
          <div style={{ height: "calc(100vh - 180px)", minHeight: 520 }}>
            <MapView />
          </div>
        </DesktopSection>
      )}
      {section === "money" && (
        <DesktopSection title="Money">
          <Expenses detail={detail} directory={directory} refresh={refresh} />
        </DesktopSection>
      )}
      {section === "documents" && (
        <DesktopSection title="Documents">
          <Documents detail={detail} directory={directory} />
        </DesktopSection>
      )}
    </>
  );
}

interface DesktopTripTopBarProps {
  title: string;
  cover: string;
  dates: string;
  daysAway: number;
  memberCount: number;
  directory: MemberDirectory;
  onExit: () => void;
  onInvite: () => void;
}

function DesktopTripTopBar({
  title,
  cover,
  dates,
  daysAway,
  memberCount,
  directory,
  onExit,
  onInvite,
}: DesktopTripTopBarProps) {
  const onlineCount = [...directory.byId.values()].filter((m) => m.online).length;
  return (
    <div className="dsk-topbar">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          minWidth: 0,
          flex: "1 1 auto",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={onExit}
          className="btn-ghost"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 10px 6px 8px",
            fontSize: 12.5,
          }}
        >
          <Icon name="chev_l" size={14} /> Trips
        </button>
        <span style={{ width: 0.5, height: 18, background: "var(--c-hair)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <span className={cover} style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0 }} />
          <div
            style={{
              fontFamily: "var(--sf-display)",
              fontSize: 22,
              lineHeight: 1.0,
              fontWeight: 400,
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 360,
            }}
          >
            {title}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            color: "var(--c-ink-3)",
            fontSize: 13,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <Icon name="calendar" size={14} /> {dates}
          </span>
          {daysAway > 0 && <span>· in {daysAway}d</span>}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <AvatarStack ids={directory.ids} size={24} max={5} />
          <span style={{ fontSize: 11.5, color: "var(--c-ink-3)", whiteSpace: "nowrap" }}>
            {memberCount} {memberCount === 1 ? "traveler" : "travelers"}
            {onlineCount > 0 ? ` · ${onlineCount} online` : ""}
          </span>
        </div>
        <button
          className="btn-ghost"
          onClick={onInvite}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "7px 11px",
            fontSize: 12.5,
          }}
        >
          <Icon name="user_plus" size={14} /> Invite
        </button>
      </div>
    </div>
  );
}

interface DesktopAllTripsProps {
  tripsResult: ReturnType<typeof useTrips>;
  onOpenTrip: (id: string) => void;
  onNewTrip: () => void;
}

function DesktopAllTrips({ tripsResult, onOpenTrip, onNewTrip }: DesktopAllTripsProps) {
  const summaries = (tripsResult.trips ?? []).map(adaptTripSummary);
  const upcoming = summaries.filter((t) => t.status === "planning").sort(
    (a, b) => a.daysAway - b.daysAway,
  );
  const past = summaries.filter((t) => t.status === "past");
  const next = upcoming[0];

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div>
          <h1 className="large-title" style={{ fontSize: 44 }}>
            Your trips
          </h1>
          <div style={{ color: "var(--c-ink-3)", fontSize: 14, marginTop: 4 }}>
            {tripsResult.loading && tripsResult.trips === null ? (
              "Loading…"
            ) : tripsResult.error ? (
              <span style={{ color: "var(--c-accent)" }}>{tripsResult.error}</span>
            ) : (
              <>
                <span style={{ color: "var(--c-ink-2)" }}>{upcoming.length} in planning</span> ·{" "}
                {past.length} past
              </>
            )}
          </div>
        </div>
        <button className="btn-pri" onClick={onNewTrip}>
          <Icon name="plus" size={16} /> New trip
        </button>
      </div>

      {summaries.length === 0 && !tripsResult.loading && (
        <div
          className="card"
          style={{
            padding: 28,
            borderRadius: 18,
            background: "var(--c-tint)",
            border: 0,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--sf-display)",
              fontSize: 24,
              letterSpacing: "-0.02em",
              marginBottom: 8,
            }}
          >
            Plan your first trip
          </div>
          <div style={{ fontSize: 13, color: "var(--c-ink-2)", marginBottom: 16 }}>
            Bring everyone into one shared plan.
          </div>
          <button className="btn-pri" onClick={onNewTrip}>
            <Icon name="plus" size={16} /> Create trip
          </button>
        </div>
      )}

      {next && (
        <button
          onClick={() => onOpenTrip(next.id)}
          className={next.cover}
          style={{
            height: 280,
            borderRadius: 24,
            position: "relative",
            overflow: "hidden",
            padding: 28,
            color: "#fff",
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            border: 0,
            boxShadow: "0 18px 40px -16px rgba(0,0,0,.3)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,.32) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,.4) 100%)",
            }}
          />
          <div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
            <span
              className="chip"
              style={{
                background: "rgba(255,255,255,.22)",
                color: "#fff",
                backdropFilter: "blur(10px)",
                whiteSpace: "nowrap",
              }}
            >
              {next.daysAway > 0
                ? `Next trip · in ${next.daysAway} days`
                : next.daysAway === 0
                ? "Today"
                : `${Math.abs(next.daysAway)} days ago`}
            </span>
            <span
              className="chip"
              style={{
                background: "rgba(255,255,255,.22)",
                color: "#fff",
                backdropFilter: "blur(10px)",
              }}
            >
              <Icon name="user_plus" size={14} /> {next.memberCount}
            </span>
          </div>
          <div style={{ position: "relative" }}>
            <div
              style={{
                fontFamily: "var(--sf-display)",
                fontSize: "clamp(36px, 4.8vw, 60px)",
                lineHeight: 1.0,
                letterSpacing: "-0.02em",
                textShadow: "0 1px 16px rgba(0,0,0,.22)",
              }}
            >
              {next.name}
            </div>
            <div style={{ marginTop: 10, fontSize: 14, display: "flex", gap: 14, opacity: 0.96 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Icon name="calendar" size={14} /> {next.dates}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Icon name="list" size={14} /> {next.days} days
              </span>
            </div>
          </div>
        </button>
      )}

      {upcoming.length > 1 && (
        <div>
          <div className="sec-title" style={{ marginBottom: 12 }}>
            Also in planning
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 14,
            }}
          >
            {upcoming.slice(1).map((t) => (
              <DesktopTripCard key={t.id} trip={t} onOpen={() => onOpenTrip(t.id)} />
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <div className="sec-title" style={{ marginBottom: 12 }}>
            Past trips
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 14,
            }}
          >
            {past.map((t) => (
              <DesktopTripCard key={t.id} trip={t} onOpen={() => onOpenTrip(t.id)} muted />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type SummaryVM = ReturnType<typeof adaptTripSummary>;

function DesktopTripCard({
  trip,
  onOpen,
  muted,
}: {
  trip: SummaryVM;
  onOpen: () => void;
  muted?: boolean;
}) {
  return (
    <button
      onClick={onOpen}
      className="card"
      style={{
        padding: 12,
        borderRadius: 18,
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        opacity: muted ? 0.8 : 1,
      }}
    >
      <div className={trip.cover} style={{ height: 120, borderRadius: 12, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: 8,
            right: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <span
            className="chip"
            style={{
              background: "rgba(255,255,255,.22)",
              color: "#fff",
              backdropFilter: "blur(10px)",
              fontSize: 11,
            }}
          >
            <Icon name="user_plus" size={11} /> {trip.memberCount}
          </span>
        </div>
      </div>
      <div style={{ padding: "0 4px 4px" }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.1 }}>{trip.name}</div>
        <div
          style={{
            fontSize: 12,
            color: "var(--c-ink-3)",
            marginTop: 4,
            display: "flex",
            gap: 10,
          }}
        >
          <span>{trip.dates}</span>
          <span>·</span>
          <span>{trip.days}d</span>
          {trip.daysAway > 0 && (
            <>
              <span>·</span>
              <span style={{ color: "var(--c-accent)", fontWeight: 700 }}>in {trip.daysAway}d</span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}

function DesktopActivityWrap({ user, onOpenTrip }: { user: User; onOpenTrip: (id: string) => void }) {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", display: "grid", gap: 18 }}>
      <div>
        <h1 className="large-title" style={{ fontSize: 40 }}>
          Activity
        </h1>
        <div style={{ color: "var(--c-ink-3)", fontSize: 14, marginTop: 4 }}>
          Everything happening across your trips
        </div>
      </div>
      <ActivityScreen user={user} onOpenTrip={onOpenTrip} />
    </div>
  );
}

function DesktopSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div style={{ fontFamily: "var(--sf-display)", fontSize: 28, letterSpacing: "-0.02em" }}>
          {title}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

interface DesktopOverviewProps {
  detail: TripDetail;
  trip: ReturnType<typeof adaptTripDetail>;
  directory: MemberDirectory;
  cursors: Record<string, { x: number; y: number }>;
  onGoToSection: (s: DesktopSectionId) => void;
  planSub: PlanSub;
  setPlanSub: (s: PlanSub) => void;
  refresh: () => Promise<void>;
}

function DesktopOverview({
  detail,
  trip,
  directory,
  cursors,
  onGoToSection,
  planSub,
  setPlanSub,
  refresh,
}: DesktopOverviewProps) {
  const itinRef = useRef<HTMLDivElement | null>(null);
  const pollsRef = useRef<HTMLDivElement | null>(null);
  const checklistRef = useRef<HTMLDivElement | null>(null);
  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) =>
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const others = [...directory.byId.values()].filter((m) => m.id !== directory.me.id);

  const focusedTab: PlanSub = planSub;
  void focusedTab;
  void setPlanSub;

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div
        className={trip.cover}
        style={{
          borderRadius: 24,
          position: "relative",
          overflow: "hidden",
          padding: "28px 28px 26px",
          color: "#fff",
          boxShadow:
            "0 1px 0 rgba(255,255,255,.5) inset, 0 18px 40px -16px rgba(0,0,0,.3)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,.32) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,.32) 100%)",
          }}
        />
        {others.slice(0, 2).map((u) => {
          const p = cursors[u.id] ?? { x: 0.5, y: 0.5 };
          const cx = 0.5 + p.x * 0.45;
          const cy = 0.1 + p.y * 0.5;
          return <PresenceCursor key={u.id} user={u} x={cx} y={cy} />;
        })}
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 16,
            flexWrap: "wrap",
            minHeight: 160,
          }}
        >
          <div style={{ minWidth: 0, flex: "1 1 240px" }}>
            <div
              className="chip"
              style={{
                background: "rgba(255,255,255,.22)",
                color: "#fff",
                backdropFilter: "blur(10px)",
                fontSize: 11,
                marginBottom: 12,
                whiteSpace: "nowrap",
              }}
            >
              {trip.daysAway > 0
                ? `Next trip · in ${trip.daysAway} days`
                : trip.daysAway === 0
                ? "Today"
                : `${Math.abs(trip.daysAway)} days ago`}
            </div>
            <div
              style={{
                fontFamily: "var(--sf-display)",
                fontSize: "clamp(30px, 3.6vw, 48px)",
                lineHeight: 1.04,
                letterSpacing: "-0.02em",
                textShadow: "0 1px 16px rgba(0,0,0,.22)",
                textWrap: "balance",
              }}
            >
              {trip.name}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, fontSize: 13, flexShrink: 0 }}>
            <DStat label="Days" value={trip.days} />
            <DStat label="Places" value={trip.places} />
            <DStat
              label="Budget"
              value={`${trip.budget.currency}${(trip.budget.spent / 1000).toFixed(1)}k`}
              sub={`/ ${trip.budget.currency}${(trip.budget.total / 1000).toFixed(1)}k`}
            />
          </div>
        </div>
      </div>

      <div className="dsk-jump">
        <JumpCard
          label="Itinerary"
          sub={`${detail.days.length} ${detail.days.length === 1 ? "day" : "days"} · ${
            trip.places
          } stops`}
          icon="list"
          onClick={() => scrollTo(itinRef)}
          accent="var(--c-link)"
        />
        <JumpCard
          label="Map"
          sub="Trip places"
          icon="map"
          onClick={() => onGoToSection("map")}
          accent="var(--c-ink)"
        />
        <JumpCard
          label="Checklist"
          sub="Collaborative packing"
          icon="check"
          onClick={() => scrollTo(checklistRef)}
          accent="var(--c-accent)"
          highlight
        />
        <JumpCard
          label="Money"
          sub={`${trip.budget.currency}${trip.budget.spent.toLocaleString()} of ${
            trip.budget.currency
          }${trip.budget.total.toLocaleString()}`}
          icon="cash"
          onClick={() => onGoToSection("money")}
          accent="var(--c-ink)"
        />
      </div>

      <div className="dsk-grid-3">
        <div style={{ display: "grid", gap: 18 }}>
          <div
            ref={itinRef}
            className="card"
            style={{ padding: 18, borderRadius: 20, scrollMarginTop: 16 }}
          >
            <DBlockHeader title="Itinerary" sub="Drag to reorder · everyone sees it" />
            <div style={{ marginTop: 12 }}>
              <Itinerary
                embed
                detail={detail}
                directory={directory}
                meId={directory.me.id}
                refresh={refresh}
              />
            </div>
          </div>

          <div
            ref={checklistRef}
            className="card"
            style={{ padding: 18, borderRadius: 20, scrollMarginTop: 16 }}
          >
            <DBlockHeader title="Checklist" sub="Live, shared with everyone on the trip" />
            <div style={{ marginTop: 12 }}>
              <Checklist embed directory={directory} />
            </div>
          </div>

          <div
            ref={pollsRef}
            className="card"
            style={{ padding: 18, borderRadius: 20, scrollMarginTop: 16 }}
          >
            <DBlockHeader title="Polls" sub="Live across the group" />
            <div style={{ marginTop: 12 }}>
              <Polls embed directory={directory} />
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <div className="card" style={{ padding: 16, borderRadius: 18 }}>
            <DBlockHeader title="Crew" sub={`${detail.members.length} travelers`} />
            <div style={{ marginTop: 10, display: "grid", gap: 2 }}>
              {detail.members.map((m, i) => {
                const u = directory.resolve(m.id);
                return (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 0",
                      borderTop: i === 0 ? "0" : "0.5px solid var(--c-hair)",
                    }}
                  >
                    <Avatar user={u} size={28} showOnline />
                    <div style={{ flex: 1, lineHeight: 1.2 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>
                        {m.id === directory.me.id ? "You" : m.name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--c-ink-3)" }}>
                        {m.email} · {m.role}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card" style={{ padding: 16, borderRadius: 18 }}>
            <DBlockHeader
              title="Activity"
              sub={
                others[0] ? <Typing user={others[0]} /> : "Latest in this trip"
              }
            />
            <div style={{ marginTop: 10 }}>
              <DesktopTripActivity tripId={detail.id} meId={directory.me.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DStat({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div
      style={{
        padding: "8px 12px",
        borderRadius: 12,
        background: "rgba(255,255,255,.18)",
        backdropFilter: "blur(10px)",
        minWidth: 70,
        textAlign: "left",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 0.06,
          textTransform: "uppercase",
          opacity: 0.8,
        }}
      >
        {label}
      </div>
      <div
        style={{ fontSize: 18, fontWeight: 700, fontVariantNumeric: "tabular-nums", marginTop: 2 }}
      >
        {value}
        {sub && <span style={{ fontSize: 11, opacity: 0.7, fontWeight: 500 }}> {sub}</span>}
      </div>
    </div>
  );
}

function JumpCard({
  label,
  sub,
  icon,
  onClick,
  accent,
  highlight,
}: {
  label: string;
  sub: string;
  icon: IconName;
  onClick: () => void;
  accent: string;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="card"
      style={{
        padding: 14,
        borderRadius: 16,
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: 12,
        minWidth: 0,
        background: highlight ? "var(--c-tint)" : "var(--c-surface)",
        border: highlight ? 0 : "0.5px solid var(--c-hair)",
        transition: "transform .12s ease",
      }}
    >
      <span
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          flexShrink: 0,
          background: highlight ? "var(--c-surface)" : "var(--c-pressed)",
          color: accent,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={icon} size={20} />
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: -0.1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: "var(--c-ink-3)",
            marginTop: 2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {sub}
        </div>
      </div>
      <Icon name="chev_r" size={16} style={{ color: "var(--c-ink-3)", flexShrink: 0 }} />
    </button>
  );
}

function DesktopTripActivity({ tripId, meId }: { tripId: string; meId: string }) {
  const { events, loading } = useActivity({ tripId, limit: 6 });
  if (loading && !events) {
    return <div style={{ fontSize: 13, color: "var(--c-ink-3)" }}>Loading…</div>;
  }
  if (!events || events.length === 0) {
    return (
      <div style={{ fontSize: 13, color: "var(--c-ink-3)" }}>
        Nothing yet. Add an expense or invite a friend to get started.
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gap: 0 }}>
      {events.map((e, i) => (
        <ActivityRow key={e.id} event={e} meId={meId} separator={i > 0} showTrip={false} />
      ))}
    </div>
  );
}

function DBlockHeader({ title, sub }: { title: string; sub?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.1 }}>{title}</div>
        {sub && <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}
