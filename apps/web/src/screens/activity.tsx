import type { ActivityEvent, User } from "@visitrip/shared";
import { Icon, type IconName } from "../components/Icon";
import { Avatar } from "../components/Avatar";
import { activityIconFor, bucketEvents, relativeTime, summarizeActivity, useActivity } from "../lib/activity";
import { hueFor, initialsFor } from "../lib/adapters";

interface ActivityScreenProps {
  user: User;
  onOpenTrip?: (id: string) => void;
}

export function ActivityScreen({ user, onOpenTrip }: ActivityScreenProps) {
  const { events, loading, error, refresh } = useActivity({ limit: 80 });
  const me = {
    id: user.id,
    name: user.name || user.email,
    initials: initialsFor(user.name || user.email),
    hue: hueFor(user.id),
    online: true,
  };
  const buckets = events ? bucketEvents(events) : null;

  return (
    <div className="screen-enter" style={{ paddingBottom: 110 }}>
      <div
        style={{
          padding: "8px 20px 4px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Avatar user={me} size={36} showOnline />
        <button
          className="btn-ghost"
          style={{ padding: "8px 10px", borderRadius: 999 }}
          onClick={() => void refresh()}
          title="Refresh"
        >
          <Icon name="settings" size={20} />
        </button>
      </div>
      <div style={{ padding: "6px 20px 18px" }}>
        <h1 className="large-title">Activity</h1>
        <div style={{ color: "var(--c-ink-3)", fontSize: 14, marginTop: 6 }}>
          {loading && !events
            ? "Loading…"
            : error
            ? <span style={{ color: "var(--c-accent)" }}>{error}</span>
            : "Across all your trips"}
        </div>
      </div>

      {!loading && !error && events && events.length === 0 && (
        <div style={{ padding: "8px 20px 20px" }}>
          <div
            className="card"
            style={{
              padding: 20,
              borderRadius: 18,
              background: "var(--c-tint)",
              border: 0,
              fontSize: 13,
              color: "var(--c-ink-2)",
              lineHeight: 1.5,
            }}
          >
            <b style={{ color: "var(--c-ink)" }}>Nothing happening yet.</b> Once you create a trip,
            invite people, or log an expense, it'll show up here.
          </div>
        </div>
      )}

      {buckets && (
        <div style={{ padding: "0 20px 20px", display: "grid", gap: 18 }}>
          {Object.entries(buckets)
            .filter(([, v]) => v.length > 0)
            .map(([label, list]) => (
              <div key={label}>
                <div className="sec-title" style={{ marginBottom: 8 }}>
                  {label}
                </div>
                <div className="card" style={{ borderRadius: 18, overflow: "hidden" }}>
                  {list.map((e, i) => (
                    <ActivityRow
                      key={e.id}
                      event={e}
                      meId={user.id}
                      separator={i > 0}
                      onOpenTrip={onOpenTrip}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

interface ActivityRowProps {
  event: ActivityEvent;
  meId: string;
  separator?: boolean;
  showTrip?: boolean;
  onOpenTrip?: (id: string) => void;
}

export function ActivityRow({ event, meId, separator, showTrip = true, onOpenTrip }: ActivityRowProps) {
  const actor = {
    id: event.actorId,
    name: event.actorId === meId ? "You" : event.actorName,
    initials: initialsFor(event.actorName || event.actorId),
    hue: hueFor(event.actorId),
    online: false,
  };
  const summary = summarizeActivity(event);
  const accent: IconName = activityIconFor(event.kind);
  const clickable = !!onOpenTrip;
  const Tag = clickable ? "button" : "div";
  return (
    <Tag
      onClick={clickable ? () => onOpenTrip!(event.tripId) : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        borderTop: separator ? "0.5px solid var(--c-hair)" : "0",
        width: "100%",
        textAlign: "left",
        background: "transparent",
      }}
    >
      <span
        className={event.tripCover}
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          flexShrink: 0,
          position: "relative",
          display: "inline-block",
        }}
      >
        <span
          style={{
            position: "absolute",
            right: -4,
            bottom: -4,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "var(--c-surface)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--c-ink-2)",
          }}
        >
          <Icon name={accent} size={11} />
        </span>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, lineHeight: 1.35 }}>
          <Avatar user={actor} size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
          <b>{actor.name}</b>{" "}
          <span style={{ color: "var(--c-ink-2)" }}>{summary}</span>
        </div>
        {showTrip && (
          <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 2 }}>{event.tripTitle}</div>
        )}
      </div>
      <span style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{relativeTime(event.createdAt)}</span>
    </Tag>
  );
}
