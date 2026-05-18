import { useState } from "react";
import type { CreateDayInput, CreateDayItemInput, CreateExpenseInput } from "@visitrip/shared";
import { Button, Field, IconButton, Input, Sheet, Textarea } from "../components/ui";

interface AddDaySheetProps {
  defaultDate: string;
  onClose: () => void;
  onCreate: (input: CreateDayInput) => Promise<void>;
}

export function AddDaySheet({ defaultDate, onClose, onCreate }: AddDaySheetProps) {
  const [date, setDate] = useState(defaultDate);
  const [label, setLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onCreate({ date, label: label.trim() || "New day" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add day");
      setSubmitting(false);
    }
  };

  return (
    <Sheet open onClose={onClose}>
      <div style={{ padding: "0 16px 24px" }}>
        <SheetHeader title="New day" onClose={onClose} />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Label" hint="e.g. Arrival, Day in Belém, Travel home">
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Day 1" />
          </Field>
          {error && <div style={{ fontSize: 13, color: "var(--vt-destructive)" }}>{error}</div>}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <Button variant="secondary" block onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" block onClick={submit} loading={submitting}>
            Add day
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

const ITEM_TYPES: Array<{ value: CreateDayItemInput["type"]; label: string; icon: string }> = [
  { value: "place", label: "Place", icon: "pin" },
  { value: "food", label: "Food", icon: "food" },
  { value: "stay", label: "Stay", icon: "bed" },
  { value: "flight", label: "Flight", icon: "plane" },
  { value: "transit", label: "Transit", icon: "transit" },
];

interface AddDayItemSheetProps {
  onClose: () => void;
  onCreate: (input: CreateDayItemInput) => Promise<void>;
}

export function AddDayItemSheet({ onClose, onCreate }: AddDayItemSheetProps) {
  const [type, setType] = useState<CreateDayItemInput["type"]>("place");
  const [time, setTime] = useState("10:00");
  const [title, setTitle] = useState("");
  const [sub, setSub] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const icon = ITEM_TYPES.find((t) => t.value === type)?.icon ?? "pin";

  const submit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await onCreate({ type, time, title: title.trim(), sub: sub.trim() || undefined, icon });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add plan");
      setSubmitting(false);
    }
  };

  return (
    <Sheet open onClose={onClose}>
      <div style={{ padding: "0 16px 24px" }}>
        <SheetHeader title="Add to day" onClose={onClose} />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Type">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ITEM_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: 0,
                    cursor: "pointer",
                    font: "inherit",
                    fontSize: 13,
                    fontWeight: 600,
                    background:
                      type === t.value ? "var(--vt-accent)" : "var(--vt-fill-tertiary)",
                    color: type === t.value ? "var(--vt-on-accent)" : "var(--vt-label)",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Time">
            <Input value={time} onChange={(e) => setTime(e.target.value)} placeholder="10:00" />
          </Field>
          <Field label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Jerónimos Monastery" autoFocus />
          </Field>
          <Field label="Notes (optional)">
            <Textarea
              value={sub}
              onChange={(e) => setSub(e.target.value)}
              placeholder="Tickets booked for 10:00"
              rows={2}
            />
          </Field>
          {error && <div style={{ fontSize: 13, color: "var(--vt-destructive)" }}>{error}</div>}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <Button variant="secondary" block onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" block disabled={!title.trim()} loading={submitting} onClick={submit}>
            Add plan
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

interface AddExpenseSheetProps {
  defaultDate: string;
  currency: string;
  onClose: () => void;
  onCreate: (input: CreateExpenseInput) => Promise<void>;
}

export function AddExpenseSheet({ defaultDate, currency, onClose, onCreate }: AddExpenseSheetProps) {
  const [date, setDate] = useState(defaultDate);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cents = Math.round(parseFloat(amount.replace(",", ".")) * 100);
  const valid = label.trim().length > 0 && Number.isFinite(cents) && cents >= 0;

  const submit = async () => {
    if (!valid) return;
    setSubmitting(true);
    setError(null);
    try {
      await onCreate({ date, label: label.trim(), amountCents: cents, currency });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add expense");
      setSubmitting(false);
    }
  };

  return (
    <Sheet open onClose={onClose}>
      <div style={{ padding: "0 16px 24px" }}>
        <SheetHeader title="Add expense" onClose={onClose} />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="What for?">
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Lunch at Pasteis" autoFocus />
          </Field>
          <Field label={`Amount (${currency})`}>
            <Input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="42.50"
            />
          </Field>
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          {error && <div style={{ fontSize: 13, color: "var(--vt-destructive)" }}>{error}</div>}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <Button variant="secondary" block onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" block disabled={!valid} loading={submitting} onClick={submit}>
            Add expense
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

function SheetHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "4px 0 14px",
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.013em" }}>{title}</div>
      <IconButton name="close" onClick={onClose} size={32} />
    </div>
  );
}
