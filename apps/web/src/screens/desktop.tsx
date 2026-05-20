import { Fragment, useRef, useState } from "react";
import { Icon, type IconName } from "../components/Icon";
import { Avatar, AvatarStack } from "../components/Avatar";
import {
  Checkbox,
  DesktopDialog,
  PresenceCursor,
  Typing,
  useDriftingCursors,
} from "../components/ui";
import { ACTIVITY, CHECKLIST, MEMBERS, TRIPS, memberById, type Trip } from "../lib/data";
import { Itinerary } from "./itinerary";
import { Polls } from "./polls";
import { MapView } from "./map";
import { Expenses } from "./expenses";
import { Documents } from "./documents";
import { ActivityScreen } from "./activity";
import { YouScreen } from "./you";

type DesktopRoot = "trips" | "activity" | "you";
type DesktopSectionId = "plan" | "map" | "money" | "documents";

const TRIP_SECTIONS: { id: DesktopSectionId; label: string; icon: IconName }[] = [
  { id: "plan", label: "Plan", icon: "list" },
  { id: "map", label: "Map", icon: "map" },
  { id: "money", label: "Money", icon: "cash" },
  { id: "documents", label: "Documents", icon: "doc" },
];

export function DesktopShell() {
  const [tripId, setTripId] = useState<string | null>(null);
  const [section, setSection] = useState<DesktopSectionId>("plan");
  const [rootView, setRootView] = useState<DesktopRoot>("trips");
  const [showNewTrip, setShowNewTrip] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const trip = tripId ? TRIPS.find((t) => t.id === tripId) ?? null : null;
  const cursors = useDriftingCursors(
    MEMBERS.filter((m) => m.online && m.id !== "u1"),
    [tripId],
  );

  const openTrip = (id: string) => {
    setTripId(id);
    setSection("plan");
  };
  const exitTrip = () => setTripId(null);

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
              className={`dsk-side-row ${!trip && rootView === "trips" ? "active" : ""}`}
              onClick={() => {
                exitTrip();
                setRootView("trips");
              }}
            >
              <Icon name="home" size={16} style={{ width: 22 }} />
              <span style={{ flex: 1 }}>All trips</span>
              <span style={{ fontSize: 11, color: "var(--c-ink-3)" }}>
                {TRIPS.filter((t) => t.status !== "past").length}
              </span>
            </button>
            <button
              className={`dsk-side-row ${!trip && rootView === "activity" ? "active" : ""}`}
              onClick={() => {
                exitTrip();
                setRootView("activity");
              }}
            >
              <Icon name="bell" size={16} style={{ width: 22 }} />
              <span style={{ flex: 1 }}>Activity</span>
              <span className="dot" />
            </button>
            <button
              className={`dsk-side-row ${!trip && rootView === "you" ? "active" : ""}`}
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
            {TRIPS.filter((tt) => tt.status !== "past").map((tt) => {
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

          {TRIPS.some((tt) => tt.status === "past") && (
            <>
              <div className="dsk-side-label">Past</div>
              <div style={{ display: "grid", gap: 2 }}>
                {TRIPS.filter((tt) => tt.status === "past").map((tt) => (
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
            <Avatar user={memberById("u1")} size={26} showOnline />
            <div style={{ flex: 1, lineHeight: 1.2, textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>You</div>
              <div style={{ fontSize: 11, color: "var(--c-ink-3)", fontWeight: 500 }}>
                you@trip.app
              </div>
            </div>
            <Icon name="chev_r" size={14} style={{ color: "var(--c-ink-3)" }} />
          </button>
        </div>
      </aside>

      <main className="dsk-main">
        {trip && (
          <DesktopTripTopBar trip={trip} onExit={exitTrip} onInvite={() => setShowInvite(true)} />
        )}

        <div className="dsk-content">
          <div className="dsk-wrap">
            {!trip && rootView === "trips" && (
              <DesktopAllTrips onOpenTrip={openTrip} onNewTrip={() => setShowNewTrip(true)} />
            )}
            {!trip && rootView === "activity" && <DesktopActivity />}
            {!trip && rootView === "you" && <YouScreen />}

            {trip && section === "plan" && (
              <DesktopOverview trip={trip} cursors={cursors} onGoToSection={setSection} />
            )}
            {trip && section === "map" && (
              <DesktopSection title="Map">
                <div style={{ height: "calc(100vh - 180px)", minHeight: 520 }}>
                  <MapView />
                </div>
              </DesktopSection>
            )}
            {trip && section === "money" && (
              <DesktopSection title="Money">
                <Expenses />
              </DesktopSection>
            )}
            {trip && section === "documents" && (
              <DesktopSection title="Documents">
                <Documents />
              </DesktopSection>
            )}
          </div>
        </div>

        <NewTripModalDesktop open={showNewTrip} onClose={() => setShowNewTrip(false)} />
        <InviteModalDesktop open={showInvite} onClose={() => setShowInvite(false)} />
      </main>
    </div>
  );
}

function DesktopTripTopBar({
  trip,
  onExit,
  onInvite,
}: {
  trip: Trip;
  onExit: () => void;
  onInvite: () => void;
}) {
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
          <span className={trip.cover} style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0 }} />
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
            {trip.name}
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
            <Icon name="calendar" size={14} /> {trip.dates}
          </span>
          {trip.daysAway > 0 && <span>· in {trip.daysAway}d</span>}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <AvatarStack ids={trip.members} size={24} max={5} />
          <span
            style={{ fontSize: 11.5, color: "var(--c-ink-3)", whiteSpace: "nowrap" }}
          >
            {trip.members.filter((id) => memberById(id).online).length} online
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
        <button
          className="btn-pri"
          style={{ padding: "7px 11px", fontSize: 12.5, borderRadius: 10 }}
        >
          <Icon name="share" size={14} /> Share
        </button>
      </div>
    </div>
  );
}

function DesktopAllTrips({
  onOpenTrip,
  onNewTrip,
}: {
  onOpenTrip: (id: string) => void;
  onNewTrip: () => void;
}) {
  const upcoming = TRIPS.filter((t) => t.status === "planning").sort(
    (a, b) => a.daysAway - b.daysAway,
  );
  const past = TRIPS.filter((t) => t.status === "past");
  const next = upcoming[0];
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1 className="large-title" style={{ fontSize: 44 }}>
            Your trips
          </h1>
          <div style={{ color: "var(--c-ink-3)", fontSize: 14, marginTop: 4 }}>
            <span style={{ color: "var(--c-ink-2)" }}>{upcoming.length} in planning</span> · {past.length} past
          </div>
        </div>
        <button className="btn-pri" onClick={onNewTrip}>
          <Icon name="plus" size={16} /> New trip
        </button>
      </div>

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
              Next trip · in {next.daysAway} days
            </span>
            <AvatarStack ids={next.members} size={28} />
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
                <Icon name="pin" size={14} /> {next.places} places
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

function DesktopTripCard({
  trip,
  onOpen,
  muted,
}: {
  trip: Trip;
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
      <div
        className={trip.cover}
        style={{ height: 120, borderRadius: 12, position: "relative" }}
      >
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
          <AvatarStack ids={trip.members} size={22} max={3} />
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

function DesktopActivity() {
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
      <ActivityScreen />
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

function DesktopOverview({
  trip,
  cursors,
  onGoToSection,
}: {
  trip: Trip;
  cursors: Record<string, { x: number; y: number }>;
  onGoToSection: (s: DesktopSectionId) => void;
}) {
  const itinRef = useRef<HTMLDivElement>(null);
  const pollsRef = useRef<HTMLDivElement>(null);
  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) =>
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

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
          boxShadow: "0 1px 0 rgba(255,255,255,.5) inset, 0 18px 40px -16px rgba(0,0,0,.3)",
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
        {MEMBERS.filter((m) => m.online && m.id !== "u1")
          .slice(0, 2)
          .map((u) => {
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
              Next trip · in {trip.daysAway} days
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
          sub="14 stops · 4 days"
          icon="list"
          onClick={() => scrollTo(itinRef)}
          accent="var(--c-link)"
        />
        <JumpCard
          label="Map"
          sub="8 pins · day routes"
          icon="map"
          onClick={() => onGoToSection("map")}
          accent="var(--c-ink)"
        />
        <JumpCard
          label="2 open polls"
          sub="awaiting your vote"
          icon="vote"
          onClick={() => scrollTo(pollsRef)}
          accent="var(--c-accent)"
          highlight
        />
        <JumpCard
          label="Money"
          sub="€642 of €1.8k spent"
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
              <Itinerary embed />
            </div>
          </div>

          <div
            ref={pollsRef}
            className="card"
            style={{ padding: 18, borderRadius: 20, scrollMarginTop: 16 }}
          >
            <DBlockHeader title="Open polls" sub="2 awaiting your vote" />
            <div style={{ marginTop: 12 }}>
              <Polls embed />
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <div className="card" style={{ padding: 16, borderRadius: 18 }}>
            <DBlockHeader title="Up next" sub="in 24 days" />
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "var(--c-tint)",
                  color: "var(--c-accent)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="plane" size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>TAP TP1349</div>
                <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 2 }}>
                  Paris → Lisbon · Jun 12, 14:30
                </div>
              </div>
            </div>
            <div className="hair" style={{ margin: "14px 0" }} />
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "#E7E1FF",
                  color: "#5345BC",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="bed" size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Memmo Alfama</div>
                <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 2 }}>
                  Check-in 16:00 · 2 rooms · 3 nights
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 16, borderRadius: 18 }}>
            <DBlockHeader title="Activity" sub={<Typing user={memberById("u3")} />} />
            <div style={{ marginTop: 10, display: "grid", gap: 2 }}>
              {ACTIVITY.map((a, i) => {
                const u = memberById(a.who);
                return (
                  <div
                    key={a.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 0",
                      borderTop: i === 0 ? "0" : "0.5px solid var(--c-hair)",
                    }}
                  >
                    <Avatar user={u} size={24} showOnline />
                    <div style={{ flex: 1, fontSize: 13, lineHeight: 1.3 }}>
                      <b>{u.name}</b>{" "}
                      <span style={{ color: "var(--c-ink-2)" }}>{a.text}</span>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{a.at}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card" style={{ padding: 16, borderRadius: 18 }}>
            <DBlockHeader title="Checklist" sub="7 of 13 done" />
            <div
              style={{
                marginTop: 10,
                height: 8,
                borderRadius: 99,
                background: "var(--c-pressed)",
                overflow: "hidden",
              }}
            >
              <div style={{ width: `${(7 / 13) * 100}%`, height: "100%", background: "var(--c-accent)" }} />
            </div>
            <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
              {CHECKLIST.flatMap((s) => s.items)
                .filter((it) => !it.done)
                .slice(0, 4)
                .map((it) => {
                  const u = memberById(it.assigned);
                  return (
                    <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Checkbox checked={false} />
                      <span style={{ flex: 1, fontSize: 13 }}>{it.text}</span>
                      <Avatar user={u} size={18} />
                    </div>
                  );
                })}
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

function DBlockHeader({
  title,
  sub,
}: {
  title: string;
  sub?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.1 }}>{title}</div>
        {sub && <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ───── Desktop modals
function NewTripModalDesktop({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("Tokyo neon weekend");
  const [cover, setCover] = useState("cover-kyoto");
  const [dates, setDates] = useState("Sep 4 – Sep 8");
  const [invite, setInvite] = useState<string[]>(["u2", "u3"]);
  const COVERS = ["cover-lisbon", "cover-paris", "cover-kyoto", "cover-iceland"];
  return (
    <DesktopDialog open={open} onClose={onClose} title="New trip" width={520}>
      <div className="sec-title" style={{ marginBottom: 8 }}>
        Cover
      </div>
      <div style={{ display: "flex", gap: 8, paddingBottom: 4 }}>
        {COVERS.map((c) => (
          <button
            key={c}
            onClick={() => setCover(c)}
            className={c}
            style={{
              flex: 1,
              height: 64,
              borderRadius: 12,
              border: cover === c ? "2.5px solid var(--c-accent)" : "2.5px solid transparent",
            }}
          />
        ))}
      </div>
      <div className="sec-title" style={{ marginTop: 14, marginBottom: 8 }}>
        Name
      </div>
      <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="sec-title" style={{ marginTop: 14, marginBottom: 8 }}>
        Dates
      </div>
      <input className="input" value={dates} onChange={(e) => setDates(e.target.value)} />
      <div className="sec-title" style={{ marginTop: 14, marginBottom: 8 }}>
        Invite friends
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        {MEMBERS.filter((m) => m.id !== "u1").map((m) => {
          const on = invite.includes(m.id);
          return (
            <button
              key={m.id}
              onClick={() =>
                setInvite((prev) =>
                  on ? prev.filter((i) => i !== m.id) : [...prev, m.id],
                )
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 12,
                background: "var(--c-surface)",
                border: "0.5px solid var(--c-hair)",
                width: "100%",
                textAlign: "left",
              }}
            >
              <Avatar user={m} size={26} showOnline />
              <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{m.name}</div>
              <Checkbox checked={on} />
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 18, display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button className="btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button className="btn-pri" onClick={onClose}>
          <Icon name="sparkle" size={16} /> Create trip
        </button>
      </div>
    </DesktopDialog>
  );
}

function InviteModalDesktop({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <DesktopDialog open={open} onClose={onClose} title="Invite to trip" width={460}>
      <div
        className="card"
        style={{
          padding: 12,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "var(--c-surface)",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "var(--c-tint)",
            color: "var(--c-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="share" size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: "var(--c-ink-3)" }}>Share link · expires in 7d</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>trip.app/j/lisbon-mn3k7</div>
        </div>
        <button
          className="btn-ghost"
          onClick={() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          }}
          style={{ background: copied ? "var(--c-tint)" : undefined }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div
        style={{
          marginTop: 14,
          padding: 12,
          borderRadius: 12,
          background: "var(--c-pressed)",
          fontSize: 12.5,
          color: "var(--c-ink-2)",
        }}
      >
        Anyone with this link can view &amp; suggest edits. You&apos;ll approve changes from non-members.
      </div>
    </DesktopDialog>
  );
}
