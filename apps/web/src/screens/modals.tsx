import { useEffect, useState } from "react";
import type {
  CoverKind,
  CreateDayItemInput,
  CreateExpenseInput,
  CreateTripInput,
  DayItemKind,
} from "@visitrip/shared";
import { Icon, type IconName } from "../components/Icon";
import { Sheet } from "../components/ui";
import { ALL_COVERS, type CoverVariant } from "../lib/data";
import { backendKind, defaultIconFor } from "../lib/adapters";
import { api } from "../lib/api";

const COVER_PREVIEW: CoverVariant[] = ALL_COVERS;
function coverKindFromClass(c: CoverVariant): CoverKind {
  return c.replace(/^cover-/, "") as CoverKind;
}

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const addDaysIso = (iso: string, n: number) => {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
  dt.setDate(dt.getDate() + n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};

export type NewTripValues = CreateTripInput;

interface NewTripModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (input: NewTripValues) => Promise<void>;
}

export function NewTripModal({ open, onClose, onCreate }: NewTripModalProps) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [cover, setCover] = useState<CoverVariant>("cover-lisbon");
  const [startDate, setStartDate] = useState(addDaysIso(todayIso(), 14));
  const [endDate, setEndDate] = useState(addDaysIso(todayIso(), 18));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset when reopened
  useEffect(() => {
    if (open) {
      setError(null);
      setBusy(false);
    }
  }, [open]);

  const valid = title.trim().length > 0 && location.trim().length > 0 && startDate <= endDate;

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onCreate({
        title: title.trim(),
        location: location.trim(),
        cover: coverKindFromClass(cover),
        startDate,
        endDate,
      });
      setTitle("");
      setLocation("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create trip");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="New trip" height="86%">
      <div style={{ marginTop: 4 }}>
        <div className="sec-title" style={{ marginBottom: 8 }}>
          Cover
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            scrollbarWidth: "none",
            paddingBottom: 4,
          }}
        >
          {COVER_PREVIEW.map((c) => (
            <button
              key={c}
              onClick={() => setCover(c)}
              className={c}
              style={{
                width: 100,
                height: 64,
                borderRadius: 14,
                flexShrink: 0,
                border:
                  cover === c ? "2.5px solid var(--c-accent)" : "2.5px solid transparent",
                boxShadow: cover === c ? "0 0 0 1px var(--c-bg) inset" : "none",
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="sec-title" style={{ marginBottom: 8 }}>
          Name
        </div>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Where are we going?"
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="sec-title" style={{ marginBottom: 8 }}>
          Location
        </div>
        <input
          className="input"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Lisbon, Portugal"
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="sec-title" style={{ marginBottom: 8 }}>
          Dates
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input
            className="input"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            className="input"
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 14, fontSize: 13, color: "var(--c-accent)" }}>{error}</div>
      )}

      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <button className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>
          Cancel
        </button>
        <button
          className="btn-pri"
          style={{ flex: 2, opacity: valid && !busy ? 1 : 0.5 }}
          onClick={submit}
          disabled={!valid || busy}
        >
          <Icon name="sparkle" size={16} /> {busy ? "Creating…" : "Create trip"}
        </button>
      </div>
    </Sheet>
  );
}

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  tripId: string | null;
}

export function InviteModal({ open, onClose, tripId }: InviteModalProps) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !tripId) return;
    let alive = true;
    setLoading(true);
    setError(null);
    api
      .createInvite(tripId, {})
      .then((res) => alive && setToken(res.token))
      .catch((e) => alive && setError(e instanceof Error ? e.message : "Could not create invite"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [open, tripId]);

  const link = token
    ? `${typeof window === "undefined" ? "" : window.location.origin}/invite/${token}`
    : "—";

  const copy = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Invite to trip">
      <div
        className="card"
        style={{
          padding: 14,
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "var(--c-tint)",
            color: "var(--c-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="share" size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, color: "var(--c-ink-3)" }}>
            {loading ? "Generating link…" : error ? "Error" : "Share link"}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {error ?? link}
          </div>
        </div>
        <button
          className="btn-ghost"
          onClick={copy}
          disabled={!token}
          style={{ background: copied ? "var(--c-tint)" : undefined, opacity: token ? 1 : 0.5 }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div
        style={{
          marginTop: 18,
          padding: 12,
          borderRadius: 12,
          background: "var(--c-pressed)",
          fontSize: 12.5,
          color: "var(--c-ink-2)",
        }}
      >
        Anyone with this link can join as an editor. They'll see your itinerary, polls,
        expenses, and the shared checklist in real time.
      </div>
    </Sheet>
  );
}

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (exp: CreateExpenseInput) => Promise<void>;
  members: string[];
  currency: string;
  meId: string;
}

export function AddExpenseModal({
  open,
  onClose,
  onAdd,
  members,
  currency,
  meId,
}: AddExpenseModalProps) {
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");
  const [paidBy, setPaidBy] = useState(meId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAmount("");
      setLabel("");
      setPaidBy(meId);
      setBusy(false);
      setError(null);
    }
  }, [open, meId]);

  const submit = async () => {
    const a = parseFloat(amount) || 0;
    if (!a || !label.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onAdd({
        date: new Date().toISOString().slice(0, 10),
        label: label.trim(),
        amountCents: Math.round(a * 100),
        currency,
        paidById: paidBy,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add expense");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Add expense" height="80%">
      <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
        <div
          style={{
            fontFamily: "var(--sf-display)",
            fontSize: 64,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            color: amount ? "var(--c-ink)" : "var(--c-ink-4)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {currency}
          {amount || "0"}
        </div>
        <Keypad
          onPress={(k) => {
            if (k === "⌫") setAmount((a) => a.slice(0, -1));
            else if (k === ".") setAmount((a) => (a.includes(".") ? a : a + "."));
            else setAmount((a) => (a + k).replace(/^0(\d)/, "$1"));
          }}
        />
      </div>

      <input
        className="input"
        placeholder="What for? (e.g. Dinner, Tram tickets)"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />

      <div style={{ marginTop: 14 }}>
        <div className="sec-title" style={{ marginBottom: 8 }}>
          Paid by
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
          {members.map((id) => {
            const on = paidBy === id;
            return (
              <button
                key={id}
                onClick={() => setPaidBy(id)}
                style={{
                  flexShrink: 0,
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: on ? "var(--c-ink)" : "var(--c-surface)",
                  color: on ? "var(--c-bg)" : "var(--c-ink)",
                  border: on ? 0 : "0.5px solid var(--c-hair)",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {id === meId ? "You" : id.slice(0, 6)}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 14, fontSize: 13, color: "var(--c-accent)" }}>{error}</div>
      )}

      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <button className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>
          Cancel
        </button>
        <button
          className="btn-acc"
          style={{ flex: 2 }}
          onClick={submit}
          disabled={busy || !label.trim() || !parseFloat(amount || "0")}
        >
          {busy ? "Adding…" : "Add expense"}
        </button>
      </div>
    </Sheet>
  );
}

function Keypad({ onPress }: { onPress: (k: string) => void }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 8,
        marginTop: 10,
        maxWidth: 280,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {keys.map((k) => (
        <button
          key={k}
          onClick={() => onPress(k)}
          style={{
            height: 44,
            borderRadius: 12,
            background: "var(--c-surface)",
            border: "0.5px solid var(--c-hair)",
            fontSize: 18,
            fontWeight: 500,
            fontVariantNumeric: "tabular-nums",
            color: "var(--c-ink)",
          }}
        >
          {k}
        </button>
      ))}
    </div>
  );
}

const KIND_OPTIONS: { id: "food" | "sight" | "stay" | "transit" | "show" | "flight"; icon: IconName }[] = [
  { id: "food", icon: "fork" },
  { id: "sight", icon: "star" },
  { id: "stay", icon: "bed" },
  { id: "transit", icon: "tram" },
  { id: "show", icon: "music" },
  { id: "flight", icon: "plane" },
];

interface AddItineraryProps {
  open: boolean;
  onClose: () => void;
  onAdd: (item: CreateDayItemInput) => Promise<void>;
  dayLabel: string;
}

export function AddItineraryModal({ open, onClose, onAdd, dayLabel }: AddItineraryProps) {
  const [time, setTime] = useState("12:00");
  const [title, setTitle] = useState("");
  const [sub, setSub] = useState("");
  const [kind, setKind] = useState<(typeof KIND_OPTIONS)[number]["id"]>("food");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setSub("");
      setError(null);
      setBusy(false);
    }
  }, [open]);

  const submit = async () => {
    if (!title.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const dbKind: DayItemKind = backendKind(kind);
      await onAdd({
        type: dbKind,
        time,
        title: title.trim(),
        sub: sub.trim() || undefined,
        icon: defaultIconFor(kind),
        anchor: false,
        tag: null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add item");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title={`Add to ${dayLabel}`} height="72%">
      <input
        className="input"
        autoFocus
        placeholder="What to do?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ marginBottom: 10 }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
        <input
          className="input"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="14:30"
        />
        <input
          className="input"
          value={sub}
          onChange={(e) => setSub(e.target.value)}
          placeholder="Where? (optional)"
        />
      </div>

      <div className="sec-title" style={{ marginTop: 16, marginBottom: 8 }}>
        Type
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {KIND_OPTIONS.map((k) => {
          const on = kind === k.id;
          return (
            <button
              key={k.id}
              onClick={() => setKind(k.id)}
              style={{
                padding: "9px 12px",
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: on ? "var(--c-ink)" : "var(--c-surface)",
                color: on ? "var(--c-bg)" : "var(--c-ink)",
                border: on ? 0 : "0.5px solid var(--c-hair)",
                fontSize: 13,
                fontWeight: 500,
                textTransform: "capitalize",
              }}
            >
              <Icon name={k.icon} size={14} /> {k.id}
            </button>
          );
        })}
      </div>

      {error && (
        <div style={{ marginTop: 14, fontSize: 13, color: "var(--c-accent)" }}>{error}</div>
      )}

      <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
        <button className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>
          Cancel
        </button>
        <button
          className="btn-acc"
          style={{ flex: 2 }}
          onClick={submit}
          disabled={busy || !title.trim()}
        >
          {busy ? "Adding…" : `Add to ${dayLabel}`}
        </button>
      </div>
    </Sheet>
  );
}
