import { Icon } from "../components/Icon";
import { Avatar, AvatarStack } from "../components/Avatar";
import { Cover } from "../components/ui";
import { ACTIVITY, TRIPS, memberById, type Trip } from "../lib/data";

interface TripsHomeProps {
  onOpenTrip: (id: string) => void;
  onNewTrip: () => void;
}

export function TripsHome({ onOpenTrip, onNewTrip }: TripsHomeProps) {
  const upcoming = TRIPS.filter((t) => t.status === "planning").sort((a, b) => a.daysAway - b.daysAway);
  const next = upcoming[0];
  const rest = upcoming.slice(1);
  const past = TRIPS.filter((t) => t.status === "past");
  const youUser = memberById("u1");
  const headlineActivity = ACTIVITY[0];

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
        <Avatar user={youUser} size={36} showOnline />
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-ghost" style={{ padding: "8px 10px", borderRadius: 999 }}>
            <Icon name="search" size={20} />
          </button>
          <button className="btn-ghost" style={{ padding: "8px 10px", borderRadius: 999, position: "relative" }}>
            <Icon name="bell" size={20} />
            <span
              style={{
                position: "absolute",
                top: 7,
                right: 8,
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--c-accent)",
                border: "1.5px solid var(--c-bg)",
              }}
            />
          </button>
        </div>
      </div>

      <div style={{ padding: "6px 20px 14px" }}>
        <h1 className="large-title">Your trips</h1>
        <div style={{ color: "var(--c-ink-3)", fontSize: 14, marginTop: 6, lineHeight: 1.4 }}>
          <span style={{ color: "var(--c-ink-2)" }}>
            {upcoming.length} in planning
          </span>{" "}
          · {past.length} past
        </div>
      </div>

      {next && (
        <div style={{ padding: "0 20px 18px" }}>
          <button
            onClick={() => onOpenTrip(next.id)}
            style={{ width: "100%", textAlign: "left", display: "block", borderRadius: "var(--card-radius)" }}
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
                  Next trip · in {next.daysAway} days
                </div>
                <AvatarStack ids={next.members} size={26} />
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
                    <Icon name="pin" size={14} /> {next.places} places
                  </span>
                </div>
              </div>
            </Cover>
          </button>

          <div
            className="card"
            style={{
              marginTop: 10,
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "var(--c-tint)",
              border: 0,
            }}
          >
            <Avatar user={memberById(headlineActivity.who)} size={22} />
            <div style={{ flex: 1, fontSize: 13, color: "var(--c-ink-2)" }}>
              <b style={{ color: "var(--c-ink)", fontWeight: 600 }}>
                {memberById(headlineActivity.who).name}
              </b>{" "}
              {headlineActivity.text}
            </div>
            <span style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{headlineActivity.at}</span>
          </div>
        </div>
      )}

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

      <div style={{ padding: "18px 20px 6px" }}>
        <button className="btn-pri" style={{ width: "100%" }} onClick={onNewTrip}>
          <Icon name="plus" size={18} /> New trip
        </button>
      </div>

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
    </div>
  );
}

function TripRow({ trip, onOpen, muted }: { trip: Trip; onOpen: () => void; muted?: boolean }) {
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
        <AvatarStack ids={trip.members} size={20} max={3} />
        {muted ? null : (
          <span style={{ fontSize: 10.5, color: "var(--c-ink-3)" }}>
            {trip.daysAway > 0 ? `in ${trip.daysAway}d` : "past"}
          </span>
        )}
      </div>
    </button>
  );
}
