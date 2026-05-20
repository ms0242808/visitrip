import { useRef } from "react";
import { Icon } from "../components/Icon";
import { Avatar, AvatarStack } from "../components/Avatar";
import { Cover, GlassPill, PresenceCursor, Typing, useDriftingCursors } from "../components/ui";
import { Itinerary } from "./itinerary";
import { Checklist } from "./checklist";
import { Polls } from "./polls";
import { ACTIVITY, MEMBERS, memberById, type Trip } from "../lib/data";

export type PlanSub = "overview" | "itinerary" | "checklist" | "polls";
export type TripQuickAction = "map" | "expenses" | "docs" | "invite";

interface TripOverviewProps {
  trip: Trip;
  onBack: () => void;
  onSubScreen: (sub: TripQuickAction) => void;
  onInvite: () => void;
  sub: PlanSub;
  setSub: (sub: PlanSub) => void;
}

const SUB_TABS: { id: PlanSub; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "itinerary", label: "Itinerary" },
  { id: "checklist", label: "Checklist" },
  { id: "polls", label: "Polls" },
];

export function TripOverview({ trip, onBack, onSubScreen, onInvite, sub, setSub }: TripOverviewProps) {
  const cursors = useDriftingCursors(
    MEMBERS.filter((m) => m.online && m.id !== "u1"),
    [trip.id],
  );
  const tab = sub || "overview";
  const tabStripRef = useRef<HTMLDivElement | null>(null);

  const onTab = (id: PlanSub) => {
    setSub(id);
    requestAnimationFrame(() => {
      const el = tabStripRef.current;
      if (!el) return;
      let p: HTMLElement | null = el.parentElement;
      while (p && !p.classList.contains("scroll")) p = p.parentElement;
      if (!p) return;
      const offset = el.offsetTop;
      if (p.scrollTop < offset) p.scrollTo({ top: offset, behavior: "smooth" });
    });
  };

  return (
    <div className="screen-enter" style={{ paddingBottom: 110 }}>
      <div style={{ position: "relative" }}>
        <Cover
          variant={trip.cover}
          style={{
            height: 280,
            position: "relative",
            overflow: "hidden",
            borderRadius: "0 0 28px 28px",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,.32) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 60%, rgba(0,0,0,.5) 100%)",
            }}
          />

          {MEMBERS.filter((m) => m.online && m.id !== "u1").map((u) => {
            const p = cursors[u.id] ?? { x: 0.5, y: 0.5 };
            return <PresenceCursor key={u.id} user={u} x={p.x} y={p.y} />;
          })}

          <div
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "space-between",
              padding: "14px 14px 0",
            }}
          >
            <GlassPill onClick={onBack}>
              <Icon name="chev_l" size={20} />
            </GlassPill>
            <div style={{ display: "flex", gap: 8 }}>
              <GlassPill onClick={onInvite} wide>
                <Icon name="user_plus" size={18} />
                <span style={{ fontSize: 13, fontWeight: 600, marginLeft: 4 }}>Invite</span>
              </GlassPill>
              <GlassPill>
                <Icon name="share" size={18} />
              </GlassPill>
            </div>
          </div>

          <div style={{ position: "absolute", left: 20, right: 20, bottom: 28, color: "#fff" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
                fontSize: 12,
                fontWeight: 500,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  background: "rgba(255,255,255,.2)",
                  backdropFilter: "blur(10px)",
                  padding: "4px 9px",
                  borderRadius: 999,
                  letterSpacing: 0.04,
                  whiteSpace: "nowrap",
                }}
              >
                {trip.dates}
              </span>
              <span style={{ opacity: 0.92, whiteSpace: "nowrap" }}>· in {trip.daysAway} days</span>
            </div>
            <div
              style={{
                fontFamily: "var(--sf-display)",
                fontSize: 36,
                fontWeight: 400,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                textShadow: "0 1px 16px rgba(0,0,0,.22)",
                textWrap: "balance",
              }}
            >
              {trip.name}
            </div>
          </div>
        </Cover>

        <div
          style={{
            margin: "-26px 20px 0",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 999,
            background: "var(--c-surface)",
            border: "0.5px solid var(--c-hair)",
            boxShadow: "0 14px 28px -16px rgba(0,0,0,.22)",
            position: "relative",
            zIndex: 5,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
            <AvatarStack ids={trip.members} size={26} max={5} />
            <div
              style={{
                fontSize: 12.5,
                color: "var(--c-ink-2)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <b style={{ color: "var(--c-ink)" }}>{trip.members.length}</b> travelers
              <span style={{ color: "var(--c-ink-3)" }}>
                {" "}
                · {trip.members.filter((id) => memberById(id).online).length} online
              </span>
            </div>
          </div>
          <button
            onClick={onInvite}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              color: "var(--c-accent)",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            <Icon name="plus" size={14} /> Add
          </button>
        </div>
      </div>

      <div style={{ padding: "20px 20px 12px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <StatCard label="Days" big={`${trip.days}`} sub="planned" />
          <StatCard label="Places" big={`${trip.places}`} sub="on the map" />
          <StatCard
            label="Budget"
            big={`${trip.budget.currency}${trip.budget.spent.toLocaleString()}`}
            sub={`of ${trip.budget.currency}${trip.budget.total.toLocaleString()}`}
            progress={trip.budget.spent / trip.budget.total}
          />
          <StatCard label="Open polls" big="2" sub="awaiting votes" highlight />
        </div>
      </div>

      <div
        ref={tabStripRef}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          padding: "10px 20px 10px",
          display: "flex",
          gap: 6,
          overflowX: "auto",
          scrollbarWidth: "none",
          background: "color-mix(in oklab, var(--c-bg), transparent 6%)",
          backdropFilter: "blur(16px) saturate(160%)",
          WebkitBackdropFilter: "blur(16px) saturate(160%)",
          borderBottom: "0.5px solid var(--c-hair)",
        }}
      >
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onTab(t.id)}
            style={{
              padding: "7px 14px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: -0.1,
              background: tab === t.id ? "var(--c-ink)" : "transparent",
              color: tab === t.id ? "var(--c-bg)" : "var(--c-ink-2)",
              border: tab === t.id ? "0" : "0.5px solid var(--c-hair)",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "14px 0 0" }}>
        {tab === "overview" && <OverviewBody onSubScreen={onSubScreen} />}
        {tab === "itinerary" && <Itinerary embed />}
        {tab === "checklist" && <Checklist embed />}
        {tab === "polls" && <Polls embed />}
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  big: string;
  sub: string;
  progress?: number;
  highlight?: boolean;
}

export function StatCard({ label, big, sub, progress, highlight }: StatCardProps) {
  return (
    <div
      className="card"
      style={{
        padding: 14,
        borderRadius: 16,
        background: highlight ? "var(--c-tint)" : "var(--c-surface)",
        border: highlight ? "0" : "0.5px solid var(--c-hair)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 0.06,
          textTransform: "uppercase",
          color: "var(--c-ink-3)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          marginTop: 4,
          fontFeatureSettings: '"tnum"',
        }}
      >
        {big}
      </div>
      <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 2 }}>{sub}</div>
      {typeof progress === "number" && (
        <div
          style={{
            marginTop: 8,
            height: 4,
            borderRadius: 99,
            background: "var(--c-pressed)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${Math.min(100, progress * 100)}%`,
              height: "100%",
              background: progress > 0.85 ? "var(--c-accent)" : "var(--c-ink)",
            }}
          />
        </div>
      )}
    </div>
  );
}

function OverviewBody({ onSubScreen }: { onSubScreen: (id: TripQuickAction) => void }) {
  const actions: { id: TripQuickAction; label: string; icon: "map" | "cash" | "doc" | "user_plus"; acc: string }[] = [
    { id: "map", label: "Map", icon: "map", acc: "var(--c-link)" },
    { id: "expenses", label: "Expenses", icon: "cash", acc: "var(--c-accent)" },
    { id: "docs", label: "Documents", icon: "doc", acc: "var(--c-ink)" },
    { id: "invite", label: "Invite", icon: "user_plus", acc: "var(--c-link)" },
  ];
  return (
    <div>
      <div style={{ padding: "0 20px 18px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {actions.map((a) => (
            <button
              key={a.id}
              onClick={() => onSubScreen(a.id)}
              className="card"
              style={{
                padding: "14px 8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                borderRadius: 16,
                background: "var(--c-surface)",
              }}
            >
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: "var(--c-pressed)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: a.acc,
                }}
              >
                <Icon name={a.icon} size={20} stroke={1.7} />
              </span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 20px 14px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 8,
          }}
        >
          <div className="sec-title">Live activity</div>
          <Typing user={memberById("u3")} />
        </div>
        <div className="card" style={{ borderRadius: 18, padding: "4px 0" }}>
          {ACTIVITY.map((a, i) => {
            const u = memberById(a.who);
            return (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderTop: i === 0 ? "0" : "0.5px solid var(--c-hair)",
                }}
              >
                <Avatar user={u} size={28} showOnline />
                <div style={{ flex: 1, fontSize: 14, lineHeight: 1.3 }}>
                  <b style={{ fontWeight: 600 }}>{u.name}</b>
                  <span style={{ color: "var(--c-ink-2)" }}> {a.text}</span>
                </div>
                <span style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{a.at}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "0 20px 18px" }}>
        <div className="sec-title" style={{ marginBottom: 8 }}>
          Up next
        </div>
        <div
          className="card"
          style={{ padding: 14, borderRadius: 18, display: "flex", gap: 12, alignItems: "center" }}
        >
          <div
            style={{
              width: 46,
              height: 46,
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
            <div style={{ fontSize: 15, fontWeight: 600 }}>TAP TP1349 — Paris to Lisbon</div>
            <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 2 }}>
              Jun 12 · 14:30 · Seat 14A
            </div>
          </div>
          <button className="btn-ghost" style={{ padding: "8px 12px" }}>
            View
          </button>
        </div>
      </div>
    </div>
  );
}
