import { useState, type CSSProperties, type InputHTMLAttributes, type ReactNode } from "react";
import type { CoverKind, CreateTripInput } from "@visitrip/shared";
import { TripCover } from "../components/TripCover";
import { Avatar } from "../components/Avatar";
import { Icon } from "../components/Icon";
import { Button, Switch } from "../components/ui";
import { daysBetween } from "../lib/format";
import { useAuth } from "../lib/auth";

export const COVER_OPTIONS: Array<{ id: CoverKind; label: string }> = [
  { id: "cover-lisbon",   label: "Sunset" },
  { id: "cover-hokkaido", label: "Snow"   },
  { id: "cover-cdmx",     label: "City"   },
  { id: "cover-coast",    label: "Coast"  },
  { id: "cover-alps",     label: "Alps"   },
  { id: "cover-desert",   label: "Desert" },
];

const VIBE_OPTIONS: Array<{ id: string; label: string; icon: string }> = [
  { id: "city",    label: "City",     icon: "pin"    },
  { id: "beach",   label: "Beach",    icon: "sun"    },
  { id: "food",    label: "Foodie",   icon: "fork"   },
  { id: "nature",  label: "Nature",   icon: "map"    },
  { id: "culture", label: "Culture",  icon: "doc"    },
  { id: "road",    label: "Roadtrip", icon: "car"    },
  { id: "snow",    label: "Snow",     icon: "cloud"  },
  { id: "romance", label: "Romance",  icon: "heart"  },
];

function SectionLabel({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        padding: "18px 4px 8px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          color: "var(--vt-label-tertiary)",
        }}
      >
        {children}
      </div>
      {hint && <div style={{ fontSize: 12, color: "var(--vt-label-quaternary)" }}>{hint}</div>}
    </div>
  );
}

function FieldCard({ icon, children, style }: { icon?: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      className="vt-card"
      style={{ display: "flex", alignItems: "stretch", padding: 0, overflow: "hidden", ...style }}
    >
      {icon && (
        <div
          style={{
            width: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--vt-accent)",
            background: "var(--vt-accent-tint)",
            borderRight: "0.5px solid var(--vt-separator)",
            flexShrink: 0,
          }}
        >
          <Icon name={icon} size={20} strokeWidth={1.8} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>{children}</div>
    </div>
  );
}

interface NewTripScreenProps {
  onCancel: () => void;
  onCreate: (input: CreateTripInput, options?: { openInvite?: boolean }) => Promise<void> | void;
}

export function NewTripScreen({ onCancel, onCreate }: NewTripScreenProps) {
  const { state } = useAuth();
  const me = state.user;
  const today = new Date().toISOString().slice(0, 10);
  const inAWeek = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);

  const [title, setTitle] = useState("");
  const [dest, setDest] = useState("");
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(inAWeek);
  const [cover, setCover] = useState<CoverKind>("cover-lisbon");
  const [vibes, setVibes] = useState<string[]>(["city", "food"]);
  const [privateTrip, setPrivateTrip] = useState(true);
  const travelersCount = me ? 1 : 0;
  const [scrolled, setScrolled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const validDates = new Date(end) >= new Date(start);
  const days = Math.max(1, daysBetween(start, end) + 1);
  const ready = title.trim().length > 0 && dest.trim().length > 0 && validDates && !submitting;
  const previewTitle = title || "Untitled trip";

  const toggleVibe = (id: string) =>
    setVibes((vs) => (vs.includes(id) ? vs.filter((v) => v !== id) : [...vs, id]));

  const buildInput = (): CreateTripInput => ({
    title: title.trim(),
    location: dest.trim(),
    cover,
    startDate: start,
    endDate: end,
    isPrivate: privateTrip,
    vibes,
  });

  const submit = async (options?: { openInvite?: boolean }) => {
    if (!ready) return;
    setSubmitting(true);
    setErrorText(null);
    try {
      await onCreate(buildInput(), options);
    } catch (e) {
      setErrorText(e instanceof Error ? e.message : "Failed to create trip");
      setSubmitting(false);
    }
  };

  const createBtn = (
    <button
      type="button"
      disabled={!ready}
      onClick={() => void submit()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 34,
        padding: "0 14px",
        borderRadius: 999,
        border: 0,
        cursor: ready ? "pointer" : "not-allowed",
        background: ready ? "var(--vt-accent)" : "rgba(255,255,255,0.22)",
        color: ready ? "#fff" : "rgba(255,255,255,0.7)",
        backdropFilter: ready ? "none" : "blur(8px)",
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: "-0.005em",
        boxShadow: ready ? "0 4px 14px rgba(0,0,0,0.18)" : "none",
        transition: "background var(--vt-dur-fast), color var(--vt-dur-fast)",
      }}
    >
      {submitting ? <span className="vt-spin" /> : <>Create<Icon name="arrow" size={14} strokeWidth={2.2} /></>}
    </button>
  );

  return (
    <div className="vt-screen vt-screen-grouped" style={{ position: "relative" }}>
      {/* Floating glass navbar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 3,
          background: scrolled
            ? "color-mix(in oklch, var(--vt-bg-elev) 88%, transparent)"
            : "linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.06) 60%, transparent 100%)",
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          borderBottom: scrolled ? "0.5px solid var(--vt-separator)" : "0.5px solid transparent",
          transition: "background 180ms, backdrop-filter 180ms, border-color 180ms",
        }}
      >
      <div className="vt-content-narrow" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 12px",
      }}>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          style={{
            width: 34,
            height: 34,
            borderRadius: 999,
            border: 0,
            cursor: "pointer",
            background: scrolled ? "var(--vt-fill-tertiary)" : "rgba(255,255,255,0.22)",
            backdropFilter: scrolled ? "none" : "blur(8px)",
            color: scrolled ? "var(--vt-label)" : "#fff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 180ms, color 180ms",
          }}
        >
          <Icon name="close" size={18} strokeWidth={2} />
        </button>

        <div
          style={{
            flex: 1,
            textAlign: "center",
            minWidth: 0,
            padding: "0 10px",
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: scrolled ? "var(--vt-label)" : "#fff",
            opacity: scrolled ? 1 : 0,
            transition: "opacity 180ms",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {previewTitle}
        </div>

        {createBtn}
      </div>
      </div>

      <div className="vt-scroll" onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 24)}>
        <div className="vt-content-narrow">
        {/* Immersive cover header */}
        <div style={{ position: "relative", marginBottom: 8 }}>
          <TripCover kind={cover} height={300} rounded={0}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                height: "100%",
                paddingTop: 60,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 62,
                  right: 16,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.22)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "#fff",
                }}
              >
                <Icon name="calendar" size={12} strokeWidth={2} />
                {days} day{days === 1 ? "" : "s"}
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignSelf: "flex-start",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 11px 5px 9px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.22)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  color: "#fff",
                  marginBottom: 10,
                }}
              >
                <Icon name="pin" size={12} strokeWidth={2} />
                <input
                  value={dest}
                  onChange={(e) => setDest(e.target.value)}
                  placeholder="Where to?"
                  className="vt-newtrip-dest-input"
                  style={{
                    border: 0,
                    outline: "none",
                    background: "transparent",
                    font: "inherit",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    width: `${Math.max(7, (dest || "Where to?").length)}ch`,
                    minWidth: 0,
                    padding: 0,
                  }}
                />
              </div>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Name this trip"
                maxLength={42}
                className="vt-newtrip-title-input"
                style={{
                  border: 0,
                  outline: "none",
                  background: "transparent",
                  font: "inherit",
                  color: "#fff",
                  width: "100%",
                  padding: 0,
                  fontSize: 32,
                  fontWeight: 700,
                  letterSpacing: "-0.022em",
                  lineHeight: 1.05,
                  textShadow: "0 1px 6px rgba(0,0,0,0.28)",
                }}
              />

              <div
                style={{
                  marginTop: 12,
                  height: 2,
                  borderRadius: 2,
                  width: title ? 56 : 32,
                  opacity: title ? 1 : 0.55,
                  background: "#fff",
                  transition: "width 200ms, opacity 200ms",
                }}
              />
            </div>
          </TripCover>

          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: -1,
              height: 24,
              background: "linear-gradient(180deg, transparent, var(--vt-bg-grouped))",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Cover swatch row */}
        <div style={{ padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                color: "var(--vt-label-tertiary)",
              }}
            >
              Cover
            </span>
            <span style={{ flex: 1, height: 0.5, background: "var(--vt-separator)" }} />
          </div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "8px 0 4px" }}>
            {COVER_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setCover(opt.id)}
                aria-label={opt.label}
                style={{
                  flexShrink: 0,
                  padding: 0,
                  border: 0,
                  cursor: "pointer",
                  borderRadius: 12,
                  overflow: "hidden",
                  position: "relative",
                  width: 96,
                  height: 56,
                  boxShadow:
                    cover === opt.id
                      ? "0 0 0 2px var(--vt-accent), 0 0 0 4px var(--vt-bg-grouped)"
                      : "0 0 0 1px var(--vt-separator)",
                  transition: "box-shadow var(--vt-dur-fast)",
                }}
              >
                <TripCover kind={opt.id} height={56} rounded={0} />
                {cover === opt.id && (
                  <span
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: 18,
                      height: 18,
                      borderRadius: 999,
                      background: "var(--vt-accent)",
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name="check" size={11} strokeWidth={2.6} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: "0 16px 140px" }}>
          {/* When */}
          <SectionLabel>When</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <FieldCard icon="calendar">
              <div style={{ display: "flex", alignItems: "stretch" }}>
                <label
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    padding: "10px 14px",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      color: "var(--vt-label-tertiary)",
                    }}
                  >
                    From
                  </span>
                  <BareDateInput value={start} onChange={(e) => setStart(e.target.value)} />
                </label>
                <div style={{ width: 0.5, background: "var(--vt-separator)", margin: "8px 0" }} />
                <label
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    padding: "10px 14px",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      color: "var(--vt-label-tertiary)",
                    }}
                  >
                    To
                  </span>
                  <BareDateInput
                    value={end}
                    min={start}
                    onChange={(e) => setEnd(e.target.value)}
                    style={{ color: validDates ? "var(--vt-label)" : "var(--vt-destructive)" }}
                  />
                </label>
              </div>
              {!validDates && (
                <div style={{ padding: "0 14px 10px", fontSize: 12, color: "var(--vt-destructive)" }}>
                  End date is before the start date.
                </div>
              )}
            </FieldCard>
          </div>

          {/* Vibes */}
          <SectionLabel hint={`${vibes.length} selected`}>Vibe</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {VIBE_OPTIONS.map((v) => {
              const on = vibes.includes(v.id);
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => toggleVibe(v.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 12px 8px 10px",
                    borderRadius: 999,
                    border: "0.5px solid " + (on ? "transparent" : "var(--vt-separator)"),
                    background: on ? "var(--vt-accent-tint)" : "var(--vt-bg-elev)",
                    color: on ? "var(--vt-accent)" : "var(--vt-label-secondary)",
                    cursor: "pointer",
                    font: "inherit",
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "-0.003em",
                    transition: "background var(--vt-dur-fast), color var(--vt-dur-fast)",
                  }}
                >
                  <Icon name={v.icon} size={14} strokeWidth={1.9} />
                  {v.label}
                </button>
              );
            })}
          </div>

          {/* Travelers */}
          <SectionLabel hint={`${travelersCount} going`}>Travelers</SectionLabel>
          <div className="vt-card" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 4 }}>
            {me && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px",
                  borderRadius: 12,
                }}
              >
                <Avatar name={me.name} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--vt-label)" }}>
                    {me.name}
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--vt-label-tertiary)",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      You
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--vt-label-tertiary)" }}>{me.email}</div>
                </div>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    border: "1.5px solid var(--vt-accent)",
                    background: "var(--vt-accent)",
                    color: "#fff",
                    flexShrink: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="check" size={13} strokeWidth={2.8} />
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={() => void submit({ openInvite: true })}
              disabled={!ready}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "8px",
                borderRadius: 12,
                background: "transparent",
                border: 0,
                cursor: ready ? "pointer" : "not-allowed",
                font: "inherit",
                textAlign: "left",
                width: "100%",
                color: ready ? "var(--vt-accent)" : "var(--vt-label-quaternary)",
                opacity: ready ? 1 : 0.7,
              }}
            >
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  background: "var(--vt-accent-tint)",
                  color: "var(--vt-accent)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon name="plus" size={18} strokeWidth={2.2} />
              </span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Invite by email or link</span>
              <span style={{ fontSize: 12, color: "var(--vt-label-tertiary)", marginLeft: 4 }}>
                creates the trip first
              </span>
            </button>
          </div>

          {/* Privacy */}
          <SectionLabel>Privacy</SectionLabel>
          <div
            className="vt-card"
            style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}
          >
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "var(--vt-accent-tint)",
                color: "var(--vt-accent)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name="lock" size={18} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--vt-label)" }}>Private trip</div>
              <div style={{ fontSize: 12, color: "var(--vt-label-tertiary)", lineHeight: 1.4 }}>
                Only people you invite can see this trip. You can change this later.
              </div>
            </div>
            <Switch checked={privateTrip} onChange={setPrivateTrip} />
          </div>

          {errorText && (
            <div style={{ marginTop: 16, fontSize: 13, color: "var(--vt-destructive)" }}>{errorText}</div>
          )}
        </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "12px 16px 18px",
          background: "linear-gradient(180deg, transparent 0%, var(--vt-bg-grouped) 32%)",
          pointerEvents: "none",
        }}
      >
        <div className="vt-content-narrow" style={{ pointerEvents: "auto" }}>
          <Button
            variant="primary"
            size="lg"
            block
            disabled={!ready}
            loading={submitting}
            iconAfter="arrow"
            onClick={() => void submit()}
          >
            {ready ? `Create ${days}-day trip` : "Create trip"}
          </Button>
        </div>
      </div>
    </div>
  );
}

type BareDateInputProps = InputHTMLAttributes<HTMLInputElement>;

function BareDateInput(props: BareDateInputProps) {
  const { style, ...rest } = props;
  return (
    <input
      type="date"
      {...rest}
      style={{
        border: 0,
        outline: "none",
        background: "transparent",
        font: "inherit",
        fontSize: 15,
        fontWeight: 500,
        color: "var(--vt-label)",
        padding: 0,
        marginTop: 2,
        ...style,
      }}
    />
  );
}

interface CoverPickerProps {
  value: CoverKind;
  onChange: (next: CoverKind) => void;
}

export function CoverPicker({ value, onChange }: CoverPickerProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
      {COVER_OPTIONS.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onChange(c.id)}
          aria-label={c.label}
          style={{
            padding: 0,
            border: 0,
            cursor: "pointer",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: value === c.id ? "0 0 0 3px var(--vt-accent)" : "none",
            transition: "box-shadow 140ms",
          }}
        >
          <TripCover kind={c.id} height={70} rounded={12} />
        </button>
      ))}
    </div>
  );
}

interface NewTripSheetProps {
  onClose: () => void;
  onCreate: (input: CreateTripInput) => Promise<void> | void;
}

export function NewTripSheet({ onClose, onCreate }: NewTripSheetProps) {
  return <NewTripScreen onCancel={onClose} onCreate={onCreate} />;
}
