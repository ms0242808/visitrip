import { Icon } from "../components/Icon";
import { Avatar } from "../components/Avatar";
import { ACTIVITY, TRIPS, memberById, type ActivityEvent, type Trip } from "../lib/data";

interface FeedEntry {
  trip: Trip;
  event: ActivityEvent;
}

const FEED: FeedEntry[] = [
  { trip: TRIPS[0]!, event: ACTIVITY[0]! },
  { trip: TRIPS[0]!, event: ACTIVITY[1]! },
  { trip: TRIPS[2]!, event: { id: "a5", who: "u5", text: 'added "Reykjavik Geothermal pool"', at: "4h", icon: "plus" } },
  { trip: TRIPS[0]!, event: ACTIVITY[2]! },
  { trip: TRIPS[1]!, event: { id: "a6", who: "u4", text: "started a poll: ryokan vs hotel", at: "yesterday", icon: "vote" } },
  { trip: TRIPS[0]!, event: ACTIVITY[3]! },
  { trip: TRIPS[2]!, event: { id: "a7", who: "u3", text: "paid €120 — Ring Road fuel", at: "yesterday", icon: "cash" } },
];

export function ActivityScreen() {
  const grouped: Record<string, FeedEntry[]> = { Today: [], Yesterday: [], Earlier: [] };
  for (const e of FEED) {
    if (/yesterday/i.test(e.event.at)) grouped.Yesterday!.push(e);
    else if (/(d|w|ago)/i.test(e.event.at)) grouped.Earlier!.push(e);
    else grouped.Today!.push(e);
  }

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
        <Avatar user={memberById("u1")} size={36} showOnline />
        <button className="btn-ghost" style={{ padding: "8px 10px", borderRadius: 999 }}>
          <Icon name="settings" size={20} />
        </button>
      </div>
      <div style={{ padding: "6px 20px 18px" }}>
        <h1 className="large-title">Activity</h1>
        <div style={{ color: "var(--c-ink-3)", fontSize: 14, marginTop: 6 }}>Across all your trips</div>
      </div>

      <div style={{ padding: "0 20px 20px", display: "grid", gap: 18 }}>
        {Object.entries(grouped)
          .filter(([, v]) => v.length > 0)
          .map(([label, events]) => (
            <div key={label}>
              <div className="sec-title" style={{ marginBottom: 8 }}>
                {label}
              </div>
              <div className="card" style={{ borderRadius: 18, overflow: "hidden" }}>
                {events.map((e, i) => {
                  const u = memberById(e.event.who);
                  return (
                    <div
                      key={e.event.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 14px",
                        borderTop: i === 0 ? "0" : "0.5px solid var(--c-hair)",
                      }}
                    >
                      <span
                        className={e.trip.cover}
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
                            right: -2,
                            bottom: -2,
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            background: "var(--c-surface)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Avatar user={u} size={14} />
                        </span>
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, lineHeight: 1.35 }}>
                          <b>{u.name}</b>{" "}
                          <span style={{ color: "var(--c-ink-2)" }}>{e.event.text}</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 2 }}>
                          {e.trip.name}
                        </div>
                      </div>
                      <span style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{e.event.at}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
