import { useState } from "react";
import type { Day, Trip } from "../data/types";
import { personById } from "../data/seed";
import { TripCover } from "../components/TripCover";
import { AvatarStack } from "../components/Avatar";
import { Icon } from "../components/Icon";
import { Button, IconButton, NavBar } from "../components/ui";
import { daysBetween, fmtRange } from "../lib/format";
import { DocsPanel, ExpensesPanel, MapPanel, PackingPanel } from "./trip-panels";

type TripTab = "itinerary" | "map" | "expenses" | "packing" | "docs";

interface TripScreenProps {
  trip: Trip;
  onBack: () => void;
  onOpenDay: (day: Day) => void;
  onShare: () => void;
  onOpenSettings: () => void;
}

export function TripScreen({ trip, onBack, onOpenDay, onShare, onOpenSettings }: TripScreenProps) {
  const [tab, setTab] = useState<TripTab>("itinerary");
  const [scrolled, setScrolled] = useState(false);
  const members = trip.members.map((id) => personById(id));

  return (
    <div className="vt-screen vt-screen-grouped">
      <NavBar
        title={scrolled ? trip.title : ""}
        scrolled={scrolled}
        leading={<IconButton name="chevronL" onClick={onBack} />}
        trailing={
          <>
            <IconButton name="share" onClick={onShare} />
            <IconButton name="more" onClick={onOpenSettings} />
          </>
        }
      />
      <div className="vt-scroll" onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 130)}>
        <TripCover kind={trip.cover} height={220} rounded={0}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                opacity: 0.85,
              }}
            >
              {trip.location} · {daysBetween(trip.start, trip.end) + 1} days
            </div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                marginTop: 4,
                textShadow: "0 1px 2px rgba(0,0,0,0.2)",
              }}
            >
              {trip.title}
            </div>
            <div style={{ fontSize: 14, marginTop: 4, opacity: 0.9 }}>{fmtRange(trip.start, trip.end)}</div>
          </div>
        </TripCover>

        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="vt-card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <AvatarStack people={members} max={4} size={32} />
            <div style={{ flex: 1, fontSize: 13, color: "var(--vt-label-secondary)" }}>
              <b style={{ color: "var(--vt-label)" }}>{members.length} travelers</b>
              <div style={{ color: "var(--vt-label-tertiary)" }}>
                {members.map((m) => m.name.split(" ")[0]).join(" · ")}
              </div>
            </div>
            <Button size="sm" variant="ghost" icon="plus" onClick={onShare}>
              Invite
            </Button>
          </div>

          <div style={{ fontSize: 15, lineHeight: 1.5, color: "var(--vt-label-secondary)" }}>{trip.summary}</div>

          <div className="vt-tabs" style={{ marginTop: 4, gap: 18 }}>
            {(
              [
                { id: "itinerary", label: "Itinerary" },
                { id: "map", label: "Map" },
                { id: "expenses", label: "Expenses" },
                { id: "packing", label: "Packing" },
                { id: "docs", label: "Documents" },
              ] as Array<{ id: TripTab; label: string }>
            ).map((t) => (
              <button key={t.id} aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === "itinerary" && <ItineraryList trip={trip} onOpenDay={onOpenDay} />}
          {tab === "map" && <MapPanel trip={trip} />}
          {tab === "expenses" && <ExpensesPanel trip={trip} />}
          {tab === "packing" && <PackingPanel trip={trip} />}
          {tab === "docs" && <DocsPanel trip={trip} />}
        </div>
        <div style={{ height: 100 }} />
      </div>
    </div>
  );
}

interface ItineraryListProps {
  trip: Trip;
  onOpenDay: (day: Day) => void;
}

function ItineraryList({ trip, onOpenDay }: ItineraryListProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {trip.days.map((day, i) => {
        const has = day.items.length;
        return (
          <div
            key={day.id}
            className="vt-card"
            onClick={() => onOpenDay(day)}
            style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}
          >
            <DayChip date={day.date} accent={i === 0} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.005em" }}>
                {day.label.split(" · ")[1] ?? day.label}
              </div>
              <div style={{ fontSize: 13, color: "var(--vt-label-tertiary)", marginTop: 2 }}>
                {has
                  ? `${has} planned · ${day.items.filter((x) => x.tag).length} booked`
                  : "Open to plan"}
              </div>
            </div>
            {has > 0 && (
              <div style={{ display: "flex", gap: 4 }}>
                {day.items.slice(0, 3).map((it) => (
                  <span
                    key={it.id}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: "var(--vt-fill-tertiary)",
                      color: "var(--vt-label-secondary)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name={it.icon} size={13} />
                  </span>
                ))}
              </div>
            )}
            <Icon name="chevron" size={16} style={{ color: "var(--vt-label-quaternary)" }} />
          </div>
        );
      })}
    </div>
  );
}

interface DayChipProps {
  date: string;
  accent?: boolean;
}

function DayChip({ date, accent }: DayChipProps) {
  const d = new Date(date);
  return (
    <div
      style={{
        width: 52,
        height: 52,
        flex: "0 0 52px",
        borderRadius: 14,
        background: accent ? "var(--vt-accent)" : "var(--vt-fill-tertiary)",
        color: accent ? "var(--vt-on-accent)" : "var(--vt-label)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          opacity: 0.85,
        }}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()]}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, marginTop: 3 }}>{d.getDate()}</div>
    </div>
  );
}
