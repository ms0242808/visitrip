import { useState } from "react";
import type { CoverKind, CreateTripInput } from "@visitrip/shared";
import { TripCover } from "../components/TripCover";
import { Button, Field, IconButton, Input, Sheet } from "../components/ui";

export const COVER_OPTIONS: CoverKind[] = [
  "cover-lisbon",
  "cover-hokkaido",
  "cover-cdmx",
  "cover-coast",
  "cover-alps",
  "cover-desert",
];

interface CoverPickerProps {
  value: CoverKind;
  onChange: (next: CoverKind) => void;
}

export function CoverPicker({ value, onChange }: CoverPickerProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
      {COVER_OPTIONS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-label={c.replace("cover-", "")}
          style={{
            padding: 0,
            border: 0,
            cursor: "pointer",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: value === c ? "0 0 0 3px var(--vt-accent)" : "none",
            transition: "box-shadow 140ms",
          }}
        >
          <TripCover kind={c} height={70} rounded={12} />
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
  const [title, setTitle] = useState("");
  const [dest, setDest] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const inAWeek = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(inAWeek);
  const [cover, setCover] = useState<CoverKind>("cover-lisbon");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Sheet open onClose={onClose} height="92%">
      <div style={{ padding: "0 16px 32px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 0",
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.013em" }}>New trip</div>
          <IconButton name="close" onClick={onClose} size={32} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
          <Field label="Trip name">
            <Input
              placeholder="e.g. Lisbon & the Alentejo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field label="Where" hint="Country or city — you can refine later.">
            <Input placeholder="Portugal" value={dest} onChange={(e) => setDest(e.target.value)} />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Field label="From">
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </Field>
            <Field label="To">
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </Field>
          </div>

          <Field label="Cover">
            <CoverPicker value={cover} onChange={setCover} />
          </Field>
        </div>

        {error && (
          <div style={{ color: "var(--vt-destructive)", fontSize: 13, marginTop: 12 }}>{error}</div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <Button variant="secondary" block onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            block
            disabled={!title || !dest || submitting}
            loading={submitting}
            onClick={async () => {
              setSubmitting(true);
              setError(null);
              try {
                await onCreate({
                  title,
                  location: dest,
                  cover,
                  startDate: start,
                  endDate: end,
                });
              } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to create trip");
                setSubmitting(false);
              }
            }}
          >
            Create trip
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
