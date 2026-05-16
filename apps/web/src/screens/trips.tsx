import { useState } from "react";
import type { Trip } from "../data/types";
import { PEOPLE, personById } from "../data/seed";
import { TripCover } from "../components/TripCover";
import { Avatar, AvatarStack } from "../components/Avatar";
import { Wordmark } from "../components/Brand";
import { Icon } from "../components/Icon";
import { Button, IconButton, NavBar, Segmented } from "../components/ui";
import { daysBetween, fmtRange } from "../lib/format";
import type { Person } from "../data/types";

interface TripCardProps {
  trip: Trip;
  onOpen: (t: Trip) => void;
  presence?: Person[];
}

function TripCard({ trip, onOpen, presence = [] }: TripCardProps) {
  const days = daysBetween(trip.start, trip.end) + 1;
  const members = trip.members.map((id) => personById(id));
  return (
    <div className="vt-card" onClick={() => onOpen(trip)} style={{ cursor: "pointer", overflow: "hidden" }}>
      <TripCover kind={trip.cover} height={140} rounded={0}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", height: "100%" }}>
          <div style={{ alignSelf: "flex-end" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                opacity: 0.85,
              }}
            >
              {trip.location}
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "-0.018em",
                marginTop: 4,
                textShadow: "0 1px 2px rgba(0,0,0,0.2)",
              }}
            >
              {trip.title}
            </div>
          </div>
          {presence.length > 0 && (
            <div style={{ display: "flex", gap: 4 }}>
              {presence.slice(0, 3).map((p) => (
                <Avatar
                  key={p.id}
                  name={p.name}
                  size={24}
                  style={{ boxShadow: "0 0 0 2px rgba(255,255,255,0.4)" }}
                />
              ))}
            </div>
          )}
        </div>
      </TripCover>
      <div
        style={{
          padding: "14px 16px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--vt-label)" }}>
            {fmtRange(trip.start, trip.end)}
          </div>
          <div style={{ fontSize: 12, color: "var(--vt-label-tertiary)" }}>
            {days} days · {members.length} travelers
          </div>
        </div>
        <AvatarStack people={members} size={26} max={4} />
      </div>
    </div>
  );
}

interface EmptyStateProps {
  onNew: () => void;
}

function EmptyState({ onNew }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: 24,
          background: "var(--vt-accent-tint)",
          color: "var(--vt-accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="map" size={42} strokeWidth={1.5} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.015em", marginTop: 8 }}>
        Plan your first trip
      </div>
      <div style={{ fontSize: 14, color: "var(--vt-label-tertiary)", maxWidth: 280, lineHeight: 1.5 }}>
        Start with a few dates and a destination. You can flesh it out — or invite friends to help — anytime.
      </div>
      <Button variant="primary" size="lg" icon="plus" onClick={onNew} style={{ marginTop: 8 }}>
        New trip
      </Button>
    </div>
  );
}

interface TripsScreenProps {
  trips: Trip[];
  onOpen: (t: Trip) => void;
  onNew: () => void;
}

export function TripsScreen({ trips, onOpen, onNew }: TripsScreenProps) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [scrolled, setScrolled] = useState(false);
  const now = new Date("2026-04-01");
  const upcoming = trips.filter((t) => !t.archived && new Date(t.end) >= now);
  const past = trips.filter((t) => t.archived || new Date(t.end) < now);
  const shown = tab === "upcoming" ? upcoming : past;

  return (
    <div className="vt-screen">
      <NavBar scrolled={scrolled} leading={<Wordmark size={18} />} trailing={<IconButton name="bell" />} />
      <div className="vt-scroll" onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}>
        <div style={{ padding: "4px 16px 12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 0 14px",
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>Trips</div>
            <button
              onClick={onNew}
              aria-label="New trip"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                height: 32,
                padding: "0 12px 0 10px",
                borderRadius: 999,
                background: "var(--vt-accent-tint)",
                color: "var(--vt-accent)",
                border: 0,
                cursor: "pointer",
                font: "inherit",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "-0.005em",
                transition: "background var(--vt-dur-fast), color var(--vt-dur-fast)",
              }}
            >
              <Icon name="plus" size={16} strokeWidth={2} />
              New
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <Segmented
              value={tab}
              onChange={setTab}
              options={[
                { value: "upcoming", label: `Upcoming · ${upcoming.length}` },
                { value: "past", label: `Past · ${past.length}` },
              ]}
            />
            <IconButton name="search" />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "8px 16px 100px" }}>
          {shown.length === 0 ? (
            <EmptyState onNew={onNew} />
          ) : (
            shown.map((t) => (
              <TripCard
                key={t.id}
                trip={t}
                onOpen={onOpen}
                presence={t.id === "t1" ? [PEOPLE[1]!, PEOPLE[2]!] : []}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
