import { useState } from "react";
import type { CoverKind } from "../data/types";
import { TripCover } from "../components/TripCover";
import { Button, Field, IconButton, Input, Sheet } from "../components/ui";

interface NewTripSheetProps {
  onClose: () => void;
  onCreate: (input: { title: string; dest: string; start: string; end: string; cover: CoverKind }) => void;
}

export function NewTripSheet({ onClose, onCreate }: NewTripSheetProps) {
  const [title, setTitle] = useState("");
  const [dest, setDest] = useState("");
  const [start, setStart] = useState("2026-05-08");
  const [end, setEnd] = useState("2026-05-15");
  const [cover, setCover] = useState<CoverKind>("cover-lisbon");

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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {(["cover-lisbon", "cover-hokkaido", "cover-cdmx"] as CoverKind[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCover(c)}
                  style={{
                    padding: 0,
                    border: 0,
                    cursor: "pointer",
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: cover === c ? "0 0 0 3px var(--vt-accent)" : "none",
                    transition: "box-shadow 140ms",
                  }}
                >
                  <TripCover kind={c} height={70} rounded={12} />
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <Button variant="secondary" block onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            block
            disabled={!title || !dest}
            onClick={() => onCreate({ title, dest, start, end, cover })}
          >
            Create trip
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
