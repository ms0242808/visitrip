import { useState } from "react";
import type { TripSummary } from "@visitrip/shared";
import { TripCover } from "../components/TripCover";
import { Wordmark } from "../components/Brand";
import { Icon } from "../components/Icon";
import { Button, IconButton, NavBar, Segmented } from "../components/ui";
import { daysBetween, fmtRange } from "../lib/format";
import { useTrips } from "../lib/trips";

interface TripCardProps {
  trip: TripSummary;
  onOpen: (id: string) => void;
}

function TripCard({ trip, onOpen }: TripCardProps) {
  const days = daysBetween(trip.startDate, trip.endDate) + 1;
  return (
    <div
      className="vt-card vt-card-hover"
      onClick={() => onOpen(trip.id)}
      style={{ cursor: "pointer", overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      <TripCover kind={trip.cover} height={160} rounded={0}>
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
            {fmtRange(trip.startDate, trip.endDate)}
          </div>
          <div style={{ fontSize: 12, color: "var(--vt-label-tertiary)" }}>
            {days} days · {trip.memberCount} {trip.memberCount === 1 ? "traveler" : "travelers"}
          </div>
        </div>
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
  onOpen: (id: string) => void;
  onNew: () => void;
}

export function TripsScreen({ onOpen, onNew }: TripsScreenProps) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { trips, loading, error } = useTrips();

  const now = new Date();
  const q = query.trim().toLowerCase();
  const matches = (t: TripSummary) =>
    q.length === 0 || `${t.title} ${t.location}`.toLowerCase().includes(q);
  const upcoming = (trips ?? []).filter((t) => !t.archived && new Date(t.endDate) >= now).filter(matches);
  const past = (trips ?? []).filter((t) => t.archived || new Date(t.endDate) < now).filter(matches);
  const shown = tab === "upcoming" ? upcoming : past;

  return (
    <div className="vt-screen">
      <NavBar scrolled={scrolled} leading={<Wordmark size={18} />} />
      <div className="vt-scroll" onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}>
        <div className="vt-content-wide" style={{ padding: "4px 16px 12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0 18px",
            }}
          >
            <div className="t-large-title">Trips</div>
            <button
              onClick={onNew}
              aria-label="New trip"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                height: 34,
                padding: "0 14px 0 12px",
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
          {searchOpen ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 12,
                background: "var(--vt-fill-tertiary)",
              }}
            >
              <Icon name="search" size={16} style={{ color: "var(--vt-label-tertiary)" }} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search trips and places"
                style={{
                  flex: 1,
                  border: 0,
                  outline: "none",
                  background: "transparent",
                  font: "inherit",
                  fontSize: 15,
                  color: "var(--vt-label)",
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setQuery("");
                }}
                aria-label="Close search"
                style={{
                  border: 0,
                  background: "transparent",
                  color: "var(--vt-label-tertiary)",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <Segmented
                value={tab}
                onChange={setTab}
                options={[
                  { value: "upcoming", label: `Upcoming · ${upcoming.length}` },
                  { value: "past", label: `Past · ${past.length}` },
                ]}
              />
              <IconButton name="search" aria-label="Search trips" onClick={() => setSearchOpen(true)} />
            </div>
          )}
        </div>
        <div className="vt-content-wide" style={{ padding: "12px 16px 120px" }}>
          {loading && (
            <div style={{ padding: 24, textAlign: "center", color: "var(--vt-label-tertiary)" }}>
              Loading…
            </div>
          )}
          {error && !loading && (
            <div style={{ padding: 24, textAlign: "center", color: "var(--vt-destructive)" }}>{error}</div>
          )}
          {!loading && !error && shown.length === 0 && <EmptyState onNew={onNew} />}
          {!loading && shown.length > 0 && (
            <div className="vt-trip-grid">
              {shown.map((t) => (
                <TripCard key={t.id} trip={t} onOpen={onOpen} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
