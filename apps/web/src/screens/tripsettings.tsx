import { useState } from "react";
import type { CoverKind, TripDetail } from "@visitrip/shared";
import { Button, Field, IconButton, Input, Sheet, Switch, Textarea } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { CoverPicker } from "./newtrip";

interface TripSettingsSheetProps {
  trip: TripDetail;
  onClose: () => void;
  onChanged: () => Promise<void>;
  onDeleted: () => void;
}

export function TripSettingsSheet({ trip, onClose, onChanged, onDeleted }: TripSettingsSheetProps) {
  const { state } = useAuth();
  const isOwner = state.status === "authed" && state.user.id === trip.ownerId;

  const [title, setTitle] = useState(trip.title);
  const [location, setLocation] = useState(trip.location);
  const [startDate, setStartDate] = useState(trip.startDate);
  const [endDate, setEndDate] = useState(trip.endDate);
  const [summary, setSummary] = useState(trip.summary);
  const [cover, setCover] = useState<CoverKind>(trip.cover);
  const [archived, setArchived] = useState(trip.archived);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await api.updateTrip(trip.id, {
        title: title.trim() || trip.title,
        location: location.trim() || trip.location,
        startDate,
        endDate,
        summary,
        cover,
        archived,
      });
      await onChanged();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
      setSubmitting(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    setError(null);
    try {
      await api.deleteTrip(trip.id);
      onDeleted();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <Sheet open onClose={onClose} height="92%">
      <div style={{ padding: "0 16px 32px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 0 14px",
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.013em" }}>Trip settings</div>
          <IconButton name="close" onClick={onClose} size={32} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Trip name">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Where">
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Field label="From">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Field>
            <Field label="To">
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Field>
          </div>
          <Field label="Summary">
            <Textarea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="A short blurb for the trip card." />
          </Field>
          <Field label="Cover">
            <CoverPicker value={cover} onChange={setCover} />
          </Field>

          <div
            className="vt-list-row"
            style={{ borderRadius: 12, background: "var(--vt-fill-tertiary)", padding: "10px 14px" }}
          >
            <div className="vt-list-row__content">
              <div className="vt-list-row__title">Archive trip</div>
              <div className="vt-list-row__subtitle">Hide from Upcoming and move to Past.</div>
            </div>
            <Switch checked={archived} onChange={setArchived} />
          </div>

          {error && <div style={{ fontSize: 13, color: "var(--vt-destructive)" }}>{error}</div>}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <Button variant="secondary" block onClick={onClose} disabled={submitting || deleting}>
            Cancel
          </Button>
          <Button variant="primary" block onClick={save} loading={submitting} disabled={deleting}>
            Save
          </Button>
        </div>

        {isOwner && (
          <div style={{ marginTop: 28, paddingTop: 18, borderTop: "1px solid var(--vt-separator)" }}>
            {confirmingDelete ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 14, color: "var(--vt-label-secondary)", lineHeight: 1.5 }}>
                  Permanently delete <b>{trip.title}</b>? This removes days, plans, expenses, packing, and any
                  shared state — for every member.
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Button variant="secondary" block onClick={() => setConfirmingDelete(false)} disabled={deleting}>
                    Keep trip
                  </Button>
                  <Button
                    variant="primary"
                    block
                    loading={deleting}
                    onClick={remove}
                    style={{ background: "var(--vt-destructive)" }}
                  >
                    Delete forever
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                block
                icon="trash"
                onClick={() => setConfirmingDelete(true)}
                style={{ color: "var(--vt-destructive)" }}
              >
                Delete this trip
              </Button>
            )}
          </div>
        )}
      </div>
    </Sheet>
  );
}
