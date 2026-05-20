import type { TripSummary, User } from "@visitrip/shared";
import { Icon } from "../components/Icon";
import { Avatar } from "../components/Avatar";
import { Cover } from "../components/ui";
import { adaptTripSummary, hueFor, initialsFor } from "../lib/adapters";

interface UseTripsResult {
  trips: TripSummary[] | null;
  loading: boolean;
  error: string | null;
}

interface TripsHomeProps {
  tripsResult: UseTripsResult;
  user: User;
  onOpenTrip: (id: string) => void;
  onNewTrip: () => void;
}

export function TripsHome({ tripsResult, user, onOpenTrip, onNewTrip }: TripsHomeProps) {
  const { trips, loading, error } = tripsResult;
  const me = {
    id: user.id,
    name: user.name || user.email,
    initials: initialsFor(user.name || user.email),
    hue: hueFor(user.id),
    online: true,
  };

  const adapted = (trips ?? []).map(adaptTripSummary);
  const upcoming = adapted.filter((t) => t.status === "planning").sort((a, b) => a.daysAway - b.daysAway);
  const next = upcoming[0];
  const rest = upcoming.slice(1);
  const past = adapted.filter((t) => t.status === "past");

  return (
    <div className="screen-enter" style={{ paddingBottom: 100 }}>
      <div
        style={{
          padding: "8px 20px 4px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Avatar user={me} size={36} showOnline />
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-ghost" style={{ padding: "8px 10px", borderRadius: 999 }}>
            <Icon name="search" size={20} />
          </button>
          <button
            className="btn-ghost"
            style={{ padding: "8px 10px", borderRadius: 999, position: "relative" }}
          >
            <Icon name="bell" size={20} />
          </button>
        </div>
      </div>

      <div style={{ padding: "6px 20px 14px" }}>
        <h1 className="large-title">Your trips</h1>
        <div style={{ color: "var(--c-ink-3)", fontSize: 14, marginTop: 6, lineHeight: 1.4 }}>
          {loading && trips === null ? (
            "Loading…"
          ) : error ? (
            <span style={{ color: "var(--c-accent)" }}>{error}</span>
          ) : (
            <>
              <span style={{ color: "var(--c-ink-2)" }}>
                {upcoming.length} in planning
              </span>{" "}
              · {past.length} past
            </>
          )}
        </div>
      </div>

      {!loading && !error && adapted.length === 0 && (
        <div style={{ padding: "8px 20px 18px" }}>
          <div
            className="card"
            style={{
              padding: 20,
              borderRadius: 18,
              textAlign: "center",
              background: "var(--c-tint)",
              border: 0,
            }}
          >
            <div
              style={{
                fontFamily: "var(--sf-display)",
                fontSize: 22,
                letterSpacing: "-0.02em",
                marginBottom: 6,
              }}
            >
              Plan your first trip
            </div>
            <div style={{ fontSize: 13, color: "var(--c-ink-2)", marginBottom: 14 }}>
              A shared place for places, days, and money.
            </div>
            <button className="btn-pri" onClick={onNewTrip}>
              <Icon name="plus" size={16} /> New trip
            </button>
          </div>
        </div>
      )}

      {next && (
        <div style={{ padding: "0 20px 18px" }}>
          <button
            onClick={() => onOpenTrip(next.id)}
            style={{
              width: "100%",
              textAlign: "left",
              display: "block",
              borderRadius: "var(--card-radius)",
            }}
          >
            <Cover
              variant={next.cover}
              className="card"
              style={{
                height: 200,
                borderRadius: "var(--card-radius)",
                overflow: "hidden",
                position: "relative",
                padding: 18,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                color: "#fff",
                border: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,.18) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,.45) 100%)",
                }}
              />
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div
                  className="chip"
                  style={{
                    background: "rgba(255,255,255,.22)",
                    color: "#fff",
                    backdropFilter: "blur(8px)",
                    fontSize: 11,
                    whiteSpace: "nowrap",
                  }}
                >
                  {next.daysAway > 0
                    ? `Next trip · in ${next.daysAway} days`
                    : next.daysAway === 0
                    ? "Today"
                    : `${Math.abs(next.daysAway)} days ago`}
                </div>
                <MemberCountBadge n={next.memberCount} />
              </div>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    fontFamily: "var(--sf-display)",
                    fontSize: 32,
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.04,
                    textShadow: "0 1px 12px rgba(0,0,0,.18)",
                    textWrap: "balance",
                  }}
                >
                  {next.name}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    marginTop: 8,
                    fontSize: 13,
                    opacity: 0.96,
                    textShadow: "0 1px 8px rgba(0,0,0,.2)",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ display: "inline-flex", gap: 5, alignItems: "center", whiteSpace: "nowrap" }}>
                    <Icon name="calendar" size={14} /> {next.dates}
                  </span>
                  <span style={{ display: "inline-flex", gap: 5, alignItems: "center", whiteSpace: "nowrap" }}>
                    <Icon name="list" size={14} /> {next.days} days
                  </span>
                </div>
              </div>
            </Cover>
          </button>
        </div>
      )}

      {rest.length > 0 && (
        <div style={{ padding: "0 20px" }}>
          <div className="sec-title" style={{ marginBottom: 10 }}>
            Also in planning
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {rest.map((t) => (
              <TripRow key={t.id} trip={t} onOpen={() => onOpenTrip(t.id)} />
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: "18px 20px 6px" }}>
        <button className="btn-pri" style={{ width: "100%" }} onClick={onNewTrip}>
          <Icon name="plus" size={18} /> New trip
        </button>
      </div>

      {past.length > 0 && (
        <div style={{ padding: "14px 20px" }}>
          <div className="sec-title" style={{ marginBottom: 10 }}>
            Past trips
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {past.map((t) => (
              <TripRow key={t.id} trip={t} onOpen={() => onOpenTrip(t.id)} muted />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type SummaryVM = ReturnType<typeof adaptTripSummary>;

function TripRow({ trip, onOpen, muted }: { trip: SummaryVM; onOpen: () => void; muted?: boolean }) {
  return (
    <button
      onClick={onOpen}
      className="card"
      style={{
        width: "100%",
        padding: 12,
        display: "flex",
        gap: 12,
        alignItems: "center",
        borderRadius: "var(--card-radius)",
        textAlign: "left",
        opacity: muted ? 0.82 : 1,
      }}
    >
      <Cover variant={trip.cover} style={{ width: 56, height: 56, borderRadius: 14, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {trip.name}
        </div>
        <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 2, display: "flex", gap: 8 }}>
          <span>{trip.dates}</span>
          <span>·</span>
          <span>{trip.days}d</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
        <MemberCountBadge n={trip.memberCount} compact />
        {muted ? null : (
          <span style={{ fontSize: 10.5, color: "var(--c-ink-3)" }}>
            {trip.daysAway > 0 ? `in ${trip.daysAway}d` : trip.daysAway === 0 ? "today" : "past"}
          </span>
        )}
      </div>
    </button>
  );
}

function MemberCountBadge({ n, compact }: { n: number; compact?: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: compact ? 10.5 : 11,
        fontWeight: 600,
        color: compact ? "var(--c-ink-3)" : "#fff",
        background: compact ? "transparent" : "rgba(255,255,255,.22)",
        backdropFilter: compact ? undefined : "blur(8px)",
        padding: compact ? 0 : "4px 8px",
        borderRadius: 999,
      }}
    >
      <Icon name="user_plus" size={compact ? 11 : 13} />
      {n} {n === 1 ? "traveler" : "travelers"}
    </span>
  );
}
