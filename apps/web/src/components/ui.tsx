import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import { Avatar } from "./Avatar";
import type { Member } from "../lib/data";

// ── Cover gradient wrapper ─────────────────────────────────────
interface CoverProps {
  variant?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Cover({ variant = "cover-lisbon", children, className = "", style }: CoverProps) {
  return (
    <div className={`${variant} ${className}`} style={style}>
      {children}
    </div>
  );
}

// ── Glass pill (used over cover hero) ───────────────────────────
interface GlassPillProps {
  children: ReactNode;
  onClick?: () => void;
  wide?: boolean;
}

export function GlassPill({ children, onClick, wide }: GlassPillProps) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 38,
        minWidth: 38,
        padding: wide ? "0 12px" : 0,
        borderRadius: 999,
        background: "rgba(255,255,255,.22)",
        color: "#fff",
        backdropFilter: "blur(14px) saturate(160%)",
        WebkitBackdropFilter: "blur(14px) saturate(160%)",
        border: "0.5px solid rgba(255,255,255,.28)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 14px rgba(0,0,0,.18)",
      }}
    >
      {children}
    </button>
  );
}

// ── Live cursor (drifting) ──────────────────────────────────────
interface PresenceCursorProps {
  user: Member;
  x: number;
  y: number;
  label?: boolean;
}

export function PresenceCursor({ user, x, y, label = true }: PresenceCursorProps) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: "translate(-50%,-50%)",
        pointerEvents: "none",
        transition: "left 1.6s ease-in-out, top 1.6s ease-in-out",
        zIndex: 30,
      }}
    >
      <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 6 }}>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: `oklch(72% 0.16 ${user.hue})`,
            boxShadow: "0 0 0 2px var(--c-bg)",
            position: "relative",
            color: `oklch(72% 0.16 ${user.hue})`,
          }}
          className="live-ring"
        />
        {label && (
          <span
            style={{
              background: `oklch(72% 0.16 ${user.hue})`,
              color: "#fff",
              padding: "2px 8px",
              borderRadius: 999,
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: 0.02,
              whiteSpace: "nowrap",
            }}
          >
            {user.name}
          </span>
        )}
      </div>
    </div>
  );
}

export function useDriftingCursors(users: Member[], seedDeps: unknown[] = []) {
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(() =>
    Object.fromEntries(users.map((u) => [u.id, u.cursor ?? { x: Math.random(), y: Math.random() }])),
  );
  useEffect(() => {
    const tick = () => {
      setPositions((prev) => {
        const next: Record<string, { x: number; y: number }> = { ...prev };
        for (const u of users) {
          const p = prev[u.id] ?? { x: 0.5, y: 0.5 };
          const dx = (Math.random() - 0.5) * 0.32;
          const dy = (Math.random() - 0.5) * 0.32;
          next[u.id] = {
            x: Math.min(0.92, Math.max(0.08, p.x + dx)),
            y: Math.min(0.92, Math.max(0.08, p.y + dy)),
          };
        }
        return next;
      });
    };
    const id = window.setInterval(tick, 1800);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, seedDeps);
  return positions;
}

// ── Status bar (device chrome) ──────────────────────────────────
export function StatusBar() {
  const now = new Date();
  const h = now.getHours() % 12 || 12;
  const m = String(now.getMinutes()).padStart(2, "0");
  return (
    <div className="status-bar">
      <span>
        {h}:{m}
      </span>
      <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
        <svg width="18" height="11" viewBox="0 0 18 11">
          <rect x="0" y="7" width="3" height="4" rx="0.7" fill="currentColor" />
          <rect x="5" y="4.5" width="3" height="6.5" rx="0.7" fill="currentColor" />
          <rect x="10" y="2" width="3" height="9" rx="0.7" fill="currentColor" />
          <rect x="15" y="-.5" width="3" height="11.5" rx="0.7" fill="currentColor" opacity=".4" />
        </svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M2 4a8 8 0 0 1 11 0" />
          <path d="M4 6.5a5 5 0 0 1 7 0" />
          <circle cx="7.5" cy="9" r="1" fill="currentColor" />
        </svg>
        <svg width="26" height="12" viewBox="0 0 26 12">
          <rect x="0.5" y="0.5" width="22" height="11" rx="3" fill="none" stroke="currentColor" opacity=".4" />
          <rect x="2" y="2" width="17" height="8" rx="1.6" fill="currentColor" />
          <rect x="23" y="4" width="2" height="4" rx="1" fill="currentColor" opacity=".4" />
        </svg>
      </span>
    </div>
  );
}

// ── Tab bar (bottom) ────────────────────────────────────────────
export interface TabItem {
  id: string;
  label: string;
  icon: IconName;
}

export const ROOT_TABS: TabItem[] = [
  { id: "trips", label: "Trips", icon: "home" },
  { id: "activity", label: "Activity", icon: "bell" },
  { id: "you", label: "You", icon: "settings" },
];
export const TRIP_TABS: TabItem[] = [
  { id: "plan", label: "Plan", icon: "list" },
  { id: "map", label: "Map", icon: "map" },
  { id: "money", label: "Money", icon: "cash" },
  { id: "docs", label: "Docs", icon: "doc" },
];

interface TabBarProps {
  active: string;
  onTab: (id: string) => void;
  tabs: TabItem[];
  trip?: { name: string; cover: string } | null;
  onExitTrip?: () => void;
}

export function TabBar({ active, onTab, tabs, trip, onExitTrip }: TabBarProps) {
  return (
    <>
      {trip && (
        <button
          onClick={onExitTrip}
          style={{
            position: "absolute",
            left: "50%",
            bottom: 88,
            transform: "translateX(-50%)",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 14px 7px 10px",
            borderRadius: 999,
            background: "var(--c-ink)",
            color: "var(--c-bg)",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: -0.1,
            boxShadow: "0 8px 22px -8px rgba(0,0,0,.35)",
            zIndex: 49,
          }}
        >
          <Icon name="chev_l" size={14} />
          <span
            className={trip.cover}
            style={{
              width: 16,
              height: 16,
              borderRadius: 5,
              flexShrink: 0,
            }}
          />
          <span>{trip.name}</span>
        </button>
      )}
      <nav className="tabbar">
        {tabs.map((t) => (
          <button key={t.id} className={active === t.id ? "active" : ""} onClick={() => onTab(t.id)}>
            <span className="dot" />
            <Icon name={t.icon} size={22} stroke={1.6} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}

// ── Screen header ───────────────────────────────────────────────
interface ScreenHeaderProps {
  title?: ReactNode;
  onBack?: () => void;
  right?: ReactNode;
  subtitle?: ReactNode;
}

export function ScreenHeader({ title, onBack, right, subtitle }: ScreenHeaderProps) {
  return (
    <div style={{ padding: "6px 16px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 36 }}>
        {onBack ? (
          <button
            onClick={onBack}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
              marginLeft: -6,
              color: "var(--c-ink)",
              fontSize: 16,
              fontWeight: 500,
              padding: "6px 8px",
            }}
          >
            <Icon name="chev_l" size={18} /> <span>Back</span>
          </button>
        ) : (
          <span />
        )}
        <div style={{ flex: 1 }} />
        {right}
      </div>
      {title && (
        <div style={{ marginTop: 6 }}>
          <h1 className="large-title">{title}</h1>
          {subtitle && <div style={{ color: "var(--c-ink-3)", fontSize: 14, marginTop: 4 }}>{subtitle}</div>}
        </div>
      )}
    </div>
  );
}

// ── Sheet (bottom modal) ────────────────────────────────────────
interface SheetProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  title?: ReactNode;
  height?: string;
}

export function Sheet({ open, onClose, children, title, height }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  return (
    <>
      <div className={`sheet-backdrop ${open ? "open" : ""}`} onClick={onClose} />
      <div className={`sheet ${open ? "open" : ""}`} style={height ? { height } : undefined}>
        <div className="grabber" />
        {title && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "4px 18px 10px",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 600 }}>{title}</div>
            <button onClick={onClose} style={{ padding: 6, color: "var(--c-ink-2)" }}>
              <Icon name="close" size={20} />
            </button>
          </div>
        )}
        <div className="sheet-body">{children}</div>
      </div>
    </>
  );
}

// ── Desktop centered dialog ─────────────────────────────────────
interface DesktopDialogProps {
  open: boolean;
  onClose?: () => void;
  title: ReactNode;
  children: ReactNode;
  width?: number;
}

export function DesktopDialog({ open, onClose, title, children, width = 480 }: DesktopDialogProps) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,.32)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width,
          maxWidth: "100%",
          maxHeight: "90vh",
          background: "var(--c-bg)",
          borderRadius: 20,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 30px 60px -15px rgba(0,0,0,.4)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: "0.5px solid var(--c-hair)",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700 }}>{title}</div>
          <button onClick={onClose} style={{ padding: 6, color: "var(--c-ink-2)" }}>
            <Icon name="close" size={18} />
          </button>
        </div>
        <div style={{ padding: 18, overflow: "auto" }}>{children}</div>
      </div>
    </div>
  );
}

// ── Typing indicator ────────────────────────────────────────────
export function Typing({ user }: { user: Member }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--c-ink-3)", fontSize: 12 }}>
      <Avatar user={user} size={18} />
      <span
        style={{ display: "inline-flex", alignItems: "center", color: `oklch(72% 0.16 ${user.hue})` }}
        className="typing-dots"
      >
        <span />
        <span />
        <span />
      </span>
      <span>{user.name} is typing</span>
    </span>
  );
}

// ── Round checkbox (used in checklist, multi-pick lists) ────────
export function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      style={{
        width: 22,
        height: 22,
        borderRadius: "50%",
        border: checked ? "0" : "1.5px solid var(--c-ink-4)",
        background: checked ? "var(--c-accent)" : "transparent",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background .15s ease, transform .15s ease",
        flexShrink: 0,
      }}
    >
      {checked && (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M2.5 7L5.5 10L10.5 3" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

// ── Kind palettes — shared across itinerary / expenses / map ────
export const KIND_COLORS: Record<string, { bg: string; fg: string }> = {
  flight: { bg: "#FFE8D6", fg: "#C2542E" },
  stay: { bg: "#E7E1FF", fg: "#5345BC" },
  food: { bg: "#FFE2D2", fg: "#C2542E" },
  sight: { bg: "#E0EBFF", fg: "#3046A8" },
  transit: { bg: "#E6F0DF", fg: "#3F6B2D" },
  show: { bg: "#FBE0E7", fg: "#A8345C" },
};
export const kindBg = (k: string) => KIND_COLORS[k]?.bg ?? "var(--c-pressed)";
export const kindFg = (k: string) => KIND_COLORS[k]?.fg ?? "var(--c-ink)";
