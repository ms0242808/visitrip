import { useState } from "react";
import { Icon } from "../components/Icon";
import { Button, Field, IconButton, Input, Sheet, Switch } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import {
  APPEARANCE_LABELS,
  CURRENCY_LABELS,
  WEEK_START_LABELS,
  type Appearance,
  type Currency,
  type WeekStart,
  setPref,
  usePrefs,
} from "../lib/prefs";

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
      <IconButton name="close" onClick={onClose} size={32} aria-label="Close" />
    </div>
  );
}

function ChoiceRow<T extends string>({
  label,
  description,
  value,
  current,
  onSelect,
}: {
  label: string;
  description?: string;
  value: T;
  current: T;
  onSelect: (next: T) => void;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        border: 0,
        background: active ? "color-mix(in oklch, var(--vt-accent) 10%, transparent)" : "transparent",
        cursor: "pointer",
        font: "inherit",
        textAlign: "left",
        width: "100%",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: "var(--vt-label)" }}>{label}</div>
        {description && (
          <div style={{ fontSize: 12, color: "var(--vt-label-tertiary)", marginTop: 2 }}>{description}</div>
        )}
      </div>
      {active && <Icon name="check" size={18} style={{ color: "var(--vt-accent)" }} />}
    </button>
  );
}

interface BaseSheetProps {
  onClose: () => void;
}

export function EditProfileSheet({ onClose }: BaseSheetProps) {
  const { state, refresh } = useAuth();
  const initial = state.user?.name ?? "";
  const [name, setName] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = name.trim() !== initial && name.trim().length > 0;

  const save = async () => {
    if (!dirty) return;
    setSaving(true);
    setError(null);
    try {
      await api.updateName(name.trim());
      await refresh();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
      setSaving(false);
    }
  };

  return (
    <Sheet open onClose={onClose}>
      <div style={{ padding: "0 16px 24px" }}>
        <SheetHeader title="Edit profile" onClose={onClose} />
        <Field label="Display name">
          <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus maxLength={120} />
        </Field>
        <div style={{ fontSize: 12, color: "var(--vt-label-tertiary)", marginTop: 8 }}>
          Email and password live in Account & security.
        </div>
        {error && <div style={{ fontSize: 13, color: "var(--vt-destructive)", marginTop: 12 }}>{error}</div>}
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <Button variant="secondary" block onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" block disabled={!dirty} loading={saving} onClick={save}>
            Save
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

export function AppearanceSheet({ onClose }: BaseSheetProps) {
  const prefs = usePrefs();
  const options: Appearance[] = ["system", "light", "dark"];
  return (
    <Sheet open onClose={onClose}>
      <div style={{ padding: "0 0 12px" }}>
        <div style={{ padding: "0 16px" }}>
          <SheetHeader title="Appearance" onClose={onClose} />
        </div>
        <div className="vt-list" style={{ margin: "0 16px" }}>
          {options.map((opt) => (
            <ChoiceRow<Appearance>
              key={opt}
              label={APPEARANCE_LABELS[opt]}
              value={opt}
              current={prefs.appearance}
              onSelect={(v) => {
                setPref("appearance", v);
              }}
            />
          ))}
        </div>
      </div>
    </Sheet>
  );
}

export function CurrencySheet({ onClose }: BaseSheetProps) {
  const prefs = usePrefs();
  const options = Object.keys(CURRENCY_LABELS) as Currency[];
  return (
    <Sheet open onClose={onClose}>
      <div style={{ padding: "0 0 12px" }}>
        <div style={{ padding: "0 16px" }}>
          <SheetHeader title="Default currency" onClose={onClose} />
        </div>
        <div className="vt-list" style={{ margin: "0 16px" }}>
          {options.map((opt) => (
            <ChoiceRow<Currency>
              key={opt}
              label={CURRENCY_LABELS[opt]}
              value={opt}
              current={prefs.currency}
              onSelect={(v) => setPref("currency", v)}
            />
          ))}
        </div>
      </div>
    </Sheet>
  );
}

export function WeekStartSheet({ onClose }: BaseSheetProps) {
  const prefs = usePrefs();
  return (
    <Sheet open onClose={onClose}>
      <div style={{ padding: "0 0 12px" }}>
        <div style={{ padding: "0 16px" }}>
          <SheetHeader title="Week starts on" onClose={onClose} />
        </div>
        <div className="vt-list" style={{ margin: "0 16px" }}>
          {(["mon", "sun"] as WeekStart[]).map((opt) => (
            <ChoiceRow<WeekStart>
              key={opt}
              label={WEEK_START_LABELS[opt]}
              value={opt}
              current={prefs.weekStart}
              onSelect={(v) => setPref("weekStart", v)}
            />
          ))}
        </div>
      </div>
    </Sheet>
  );
}

export function NotificationsSheet({ onClose }: BaseSheetProps) {
  const prefs = usePrefs();
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof Notification === "undefined") return "denied";
    return Notification.permission;
  });
  const supported = typeof Notification !== "undefined";
  const enabled = permission === "granted";

  const request = async () => {
    if (!supported) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  return (
    <Sheet open onClose={onClose}>
      <div style={{ padding: "0 16px 24px" }}>
        <SheetHeader title="Notifications" onClose={onClose} />

        <div className="vt-card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: enabled ? "color-mix(in oklch, var(--vt-success) 18%, transparent)" : "var(--vt-accent-tint)",
              color: enabled ? "var(--vt-success)" : "var(--vt-accent)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon name="bell" size={18} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Browser notifications</div>
            <div style={{ fontSize: 12, color: "var(--vt-label-tertiary)" }}>
              {!supported
                ? "This browser doesn't support notifications."
                : enabled
                ? "Allowed for this site."
                : permission === "denied"
                ? "Blocked. Enable from your browser's site settings."
                : "Not granted yet."}
            </div>
          </div>
          {!enabled && supported && permission !== "denied" && (
            <Button size="sm" variant="primary" onClick={() => void request()}>
              Allow
            </Button>
          )}
        </div>

        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <ToggleRow
            label="Trip updates"
            sub="Days, places, members"
            checked={prefs.notifyTripUpdates}
            onChange={(v) => setPref("notifyTripUpdates", v)}
            disabled={!enabled}
          />
          <ToggleRow
            label="Expenses"
            sub="When someone adds an expense"
            checked={prefs.notifyExpenses}
            onChange={(v) => setPref("notifyExpenses", v)}
            disabled={!enabled}
          />
        </div>
      </div>
    </Sheet>
  );
}

function ToggleRow({
  label,
  sub,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  sub?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="vt-card"
      style={{
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: "var(--vt-label-tertiary)" }}>{sub}</div>}
      </div>
      <Switch checked={checked && !disabled} onChange={onChange} />
    </div>
  );
}

export function AccountSecuritySheet({ onClose }: BaseSheetProps) {
  const { signOut } = useAuth();
  const [mode, setMode] = useState<"menu" | "password" | "delete">("menu");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitPassword = async () => {
    setError(null);
    setInfo(null);
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setInfo("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMode("menu");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to change password");
    } finally {
      setBusy(false);
    }
  };

  const submitDelete = async () => {
    setError(null);
    setBusy(true);
    try {
      await api.deleteAccount(currentPassword);
      await signOut();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete account");
      setBusy(false);
    }
  };

  return (
    <Sheet open onClose={onClose}>
      <div style={{ padding: "0 16px 24px" }}>
        <SheetHeader title="Account & security" onClose={onClose} />

        {mode === "menu" && (
          <div className="vt-list">
            <button
              type="button"
              className="vt-list-row"
              onClick={() => {
                setError(null);
                setInfo(null);
                setMode("password");
              }}
              style={{ border: 0, background: "transparent", textAlign: "left", cursor: "pointer", width: "100%" }}
            >
              <span className="vt-row-icon"><Icon name="lock" size={16} /></span>
              <div className="vt-list-row__content">
                <div className="vt-list-row__title">Change password</div>
                <div className="vt-list-row__subtitle">Update your sign-in password</div>
              </div>
              <Icon name="chevron" size={16} style={{ color: "var(--vt-label-quaternary)" }} />
            </button>
            <button
              type="button"
              className="vt-list-row"
              onClick={() => {
                setError(null);
                setInfo(null);
                setCurrentPassword("");
                setMode("delete");
              }}
              style={{ border: 0, background: "transparent", textAlign: "left", cursor: "pointer", width: "100%" }}
            >
              <span
                className="vt-row-icon"
                style={{
                  background: "color-mix(in oklch, var(--vt-destructive) 16%, transparent)",
                  color: "var(--vt-destructive)",
                }}
              >
                <Icon name="trash" size={16} />
              </span>
              <div className="vt-list-row__content">
                <div className="vt-list-row__title" style={{ color: "var(--vt-destructive)" }}>
                  Delete account
                </div>
                <div className="vt-list-row__subtitle">Removes you and your trips you own.</div>
              </div>
              <Icon name="chevron" size={16} style={{ color: "var(--vt-label-quaternary)" }} />
            </button>
          </div>
        )}

        {mode === "password" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Current password">
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoFocus
              />
            </Field>
            <Field label="New password" hint="At least 8 characters">
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Field>
            <Field label="Confirm new password">
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Field>
            {error && <div style={{ fontSize: 13, color: "var(--vt-destructive)" }}>{error}</div>}
            {info && <div style={{ fontSize: 13, color: "var(--vt-success)" }}>{info}</div>}
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <Button variant="secondary" block onClick={() => setMode("menu")} disabled={busy}>
                Cancel
              </Button>
              <Button
                variant="primary"
                block
                onClick={() => void submitPassword()}
                loading={busy}
                disabled={!currentPassword || !newPassword || !confirmPassword}
              >
                Change password
              </Button>
            </div>
          </div>
        )}

        {mode === "delete" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 14, lineHeight: 1.5, color: "var(--vt-label-secondary)" }}>
              This deletes your account and the trips you own. Trips you only joined will stay with the other members.
              This action cannot be undone.
            </div>
            <Field label="Enter your password to confirm">
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoFocus
              />
            </Field>
            {error && <div style={{ fontSize: 13, color: "var(--vt-destructive)" }}>{error}</div>}
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <Button variant="secondary" block onClick={() => setMode("menu")} disabled={busy}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                block
                onClick={() => void submitDelete()}
                loading={busy}
                disabled={!currentPassword}
              >
                Delete my account
              </Button>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}

export function useExportData(): {
  trigger: () => Promise<void>;
  busy: boolean;
  error: string | null;
} {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trigger = async () => {
    setBusy(true);
    setError(null);
    try {
      const blob = await api.exportMyData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `visitrip-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(false);
    }
  };

  return { trigger, busy, error };
}

export function PrivacyTermsSheet({ onClose }: BaseSheetProps) {
  return (
    <Sheet open onClose={onClose}>
      <div style={{ padding: "0 16px 24px" }}>
        <SheetHeader title="Privacy & terms" onClose={onClose} />
        <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--vt-label-secondary)" }}>
          <p style={{ marginTop: 0 }}>
            Visitrip is open-source software you can self-host. The instance you're using stores only what's needed
            to run the app: your name, email, password hash, and the trips you create or join.
          </p>
          <p>
            Sessions are managed with HTTP-only cookies on the same origin. There are no third-party trackers and
            we don't sell or share your data.
          </p>
          <p>
            You can change or remove your data at any time from <b>Account & security</b>. Export your data as JSON
            from <b>Export my data</b>.
          </p>
        </div>
        <div style={{ marginTop: 18 }}>
          <Button variant="secondary" block onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

