import { useState } from "react";
import { Icon, type IconName } from "../components/Icon";
import { Avatar } from "../components/Avatar";
import { Checkbox, Sheet } from "../components/ui";
import { catIcon } from "./expenses";
import { MEMBERS, memberById, type CoverVariant, type Expense, type ItineraryItem } from "../lib/data";

const COVERS: CoverVariant[] = ["cover-lisbon", "cover-paris", "cover-kyoto", "cover-iceland"];

interface NewTripModalProps {
  open: boolean;
  onClose: () => void;
  onCreate?: (input: { name: string; cover: CoverVariant; dates: string; members: string[] }) => void;
}

export function NewTripModal({ open, onClose, onCreate }: NewTripModalProps) {
  const [name, setName] = useState("Tokyo neon weekend");
  const [cover, setCover] = useState<CoverVariant>("cover-kyoto");
  const [dates] = useState("Sep 4 – Sep 8");
  const [invite, setInvite] = useState<string[]>(["u2", "u3"]);

  const submit = () => {
    onCreate?.({ name, cover, dates, members: ["u1", ...invite] });
    onClose();
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
          {COVERS.map((c) => (
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
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Where are we going?"
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="sec-title" style={{ marginBottom: 8 }}>
          Dates
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="input"
            style={{
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Icon name="calendar" size={16} /> {dates}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="sec-title" style={{ marginBottom: 8 }}>
          Invite friends
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          {MEMBERS.filter((m) => m.id !== "u1").map((m) => {
            const on = invite.includes(m.id);
            return (
              <button
                key={m.id}
                onClick={() =>
                  setInvite((prev) => (on ? prev.filter((i) => i !== m.id) : [...prev, m.id]))
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "var(--c-surface)",
                  border: "0.5px solid var(--c-hair)",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <Avatar user={m} size={28} showOnline />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600 }}>{m.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>
                    {m.online ? "online now" : "offline"}
                  </div>
                </div>
                <Checkbox checked={on} />
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <button className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>
          Cancel
        </button>
        <button className="btn-pri" style={{ flex: 2 }} onClick={submit}>
          <Icon name="sparkle" size={16} /> Create trip
        </button>
      </div>
    </Sheet>
  );
}

export function InviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const link = "trip.app/j/lisbon-mn3k7";
  const copy = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
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
          <div style={{ fontSize: 12.5, color: "var(--c-ink-3)" }}>Share link · expires in 7d</div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {link}
          </div>
        </div>
        <button
          className="btn-ghost"
          onClick={copy}
          style={{ background: copied ? "var(--c-tint)" : undefined }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="sec-title" style={{ marginTop: 18, marginBottom: 8 }}>
        Or invite from contacts
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        {[
          ...MEMBERS.filter((m) => !["u1", "u2", "u3", "u5"].includes(m.id)),
          { id: "x1", name: "Aja Chen", initials: "AC", hue: 200, online: false },
          { id: "x2", name: "Niko M.", initials: "NM", hue: 60, online: true },
        ].map((m) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 12,
              background: "var(--c-surface)",
              border: "0.5px solid var(--c-hair)",
            }}
          >
            <Avatar user={m} size={28} showOnline />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>{m.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>
                {m.online ? "online now" : "offline"}
              </div>
            </div>
            <button className="btn-ghost" style={{ padding: "7px 12px", fontSize: 13 }}>
              Invite
            </button>
          </div>
        ))}
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
        Anyone with this link can view &amp; suggest edits. You&apos;ll approve changes from non-members.
      </div>
    </Sheet>
  );
}

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (exp: Omit<Expense, "id">) => void;
  members: string[];
}

const CATS: Expense["category"][] = ["food", "stay", "transit", "sight", "show", "flight"];

export function AddExpenseModal({ open, onClose, onAdd, members }: AddExpenseModalProps) {
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");
  const [paidBy, setPaidBy] = useState("u1");
  const [split, setSplit] = useState<string[]>(members);
  const [cat, setCat] = useState<Expense["category"]>("food");

  const submit = () => {
    const a = parseFloat(amount) || 0;
    if (!a || !label) return;
    onAdd({
      label,
      amount: a,
      currency: "€",
      paidBy,
      split,
      date: "today",
      category: cat,
    });
    setAmount("");
    setLabel("");
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
          €{amount || "0"}
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
          Category
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {CATS.map((c) => {
            const on = cat === c;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: on ? "var(--c-ink)" : "var(--c-surface)",
                  color: on ? "var(--c-bg)" : "var(--c-ink)",
                  border: on ? 0 : "0.5px solid var(--c-hair)",
                  fontSize: 13,
                  fontWeight: 500,
                  textTransform: "capitalize",
                }}
              >
                <Icon name={catIcon(c)} size={14} />
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <div className="sec-title" style={{ marginBottom: 8 }}>
          Paid by
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
          {members.map((id) => {
            const m = memberById(id);
            const on = paidBy === id;
            return (
              <button
                key={id}
                onClick={() => setPaidBy(id)}
                style={{
                  flexShrink: 0,
                  padding: "6px 12px 6px 6px",
                  borderRadius: 999,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: on ? "var(--c-ink)" : "var(--c-surface)",
                  color: on ? "var(--c-bg)" : "var(--c-ink)",
                  border: on ? 0 : "0.5px solid var(--c-hair)",
                }}
              >
                <Avatar user={m} size={22} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>
                  {m.id === "u1" ? "You" : m.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 8,
          }}
        >
          <div className="sec-title">Split between</div>
          <span style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>
            {split.length > 0 && amount && `€${(parseFloat(amount) / split.length).toFixed(2)} each`}
          </span>
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          {members.map((id) => {
            const m = memberById(id);
            const on = split.includes(id);
            return (
              <button
                key={id}
                onClick={() =>
                  setSplit((prev) => (on ? prev.filter((i) => i !== id) : [...prev, id]))
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: 12,
                  background: "var(--c-surface)",
                  border: "0.5px solid var(--c-hair)",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <Avatar user={m} size={24} />
                <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>
                  {m.id === "u1" ? "You" : m.name}
                </div>
                <Checkbox checked={on} />
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <button className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>
          Cancel
        </button>
        <button className="btn-acc" style={{ flex: 2 }} onClick={submit}>
          Add expense
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

const KINDS: { id: ItineraryItem["kind"]; icon: IconName }[] = [
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
  onAdd: (item: Omit<ItineraryItem, "id">) => void;
  day: number;
}

export function AddItineraryModal({ open, onClose, onAdd, day }: AddItineraryProps) {
  const [time, setTime] = useState("12:00");
  const [title, setTitle] = useState("");
  const [loc, setLoc] = useState("Lisbon");
  const [kind, setKind] = useState<ItineraryItem["kind"]>("food");

  const submit = () => {
    if (!title) return;
    const icon = KINDS.find((k) => k.id === kind)?.icon ?? "pin";
    onAdd({ time, title, loc, kind, who: "u1", icon });
    setTitle("");
  };

  return (
    <Sheet open={open} onClose={onClose} title={`Add to day ${day}`} height="72%">
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
          value={loc}
          onChange={(e) => setLoc(e.target.value)}
          placeholder="Where?"
        />
      </div>

      <div className="sec-title" style={{ marginTop: 16, marginBottom: 8 }}>
        Type
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {KINDS.map((k) => {
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

      <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
        <button className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>
          Cancel
        </button>
        <button className="btn-acc" style={{ flex: 2 }} onClick={submit}>
          Add to day {day}
        </button>
      </div>
    </Sheet>
  );
}
