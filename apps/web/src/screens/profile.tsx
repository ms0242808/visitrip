import { useState } from "react";
import { Avatar } from "../components/Avatar";
import { Icon } from "../components/Icon";
import { Badge, Button, IconButton, NavBar, Switch } from "../components/ui";
import { useAuth } from "../lib/auth";
import {
  APPEARANCE_LABELS,
  CURRENCY_LABELS,
  WEEK_START_LABELS,
  setPref,
  usePrefs,
} from "../lib/prefs";
import {
  AccountSecuritySheet,
  AppearanceSheet,
  CurrencySheet,
  EditProfileSheet,
  NotificationsSheet,
  PrivacyTermsSheet,
  WeekStartSheet,
  useExportData,
} from "./profile-sheets";

interface ProfileScreenProps {
  onBack?: () => void;
}

type Modal =
  | "edit"
  | "appearance"
  | "currency"
  | "weekstart"
  | "notifications"
  | "account"
  | "privacy"
  | null;

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const { state, signOut } = useAuth();
  const prefs = usePrefs();
  const [modal, setModal] = useState<Modal>(null);
  const exportData = useExportData();
  const [exportToast, setExportToast] = useState<string | null>(null);

  const user = state.user;
  if (!user) return null;

  const notifSub =
    typeof Notification === "undefined" || Notification.permission === "denied"
      ? "Off"
      : Notification.permission === "granted"
      ? [prefs.notifyTripUpdates && "Trip updates", prefs.notifyExpenses && "Expenses"]
          .filter(Boolean)
          .join(", ") || "Allowed"
      : "Not requested";

  return (
    <div className="vt-screen vt-screen-grouped">
      <NavBar leading={onBack ? <IconButton name="chevronL" onClick={onBack} /> : null} title="You" />
      <div className="vt-scroll">
        <div className="vt-content-narrow" style={{ padding: "16px 16px 120px" }}>
          <div
            className="vt-card"
            style={{
              padding: 18,
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 18,
            }}
          >
            <Avatar name={user.name} size={56} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: 13, color: "var(--vt-label-tertiary)" }}>{user.email}</div>
              <Badge variant="accent" style={{ marginTop: 6 }}>
                Free
              </Badge>
            </div>
            <IconButton name="edit" aria-label="Edit profile" onClick={() => setModal("edit")} />
          </div>

          <div className="vt-list-header">Preferences</div>
          <div className="vt-list" style={{ marginBottom: 16 }}>
            <SettingRow
              icon="sun"
              title="Appearance"
              sub={APPEARANCE_LABELS[prefs.appearance]}
              onClick={() => setModal("appearance")}
            />
            <SettingRow
              icon="globe"
              title="Default currency"
              sub={CURRENCY_LABELS[prefs.currency]}
              onClick={() => setModal("currency")}
            />
            <SettingRow
              icon="calendar"
              title="Week starts on"
              sub={WEEK_START_LABELS[prefs.weekStart]}
              onClick={() => setModal("weekstart")}
            />
            <SettingRow
              icon="bell"
              title="Notifications"
              sub={notifSub}
              onClick={() => setModal("notifications")}
            />
          </div>

          <div className="vt-list-header">Sync</div>
          <div className="vt-list" style={{ marginBottom: 16 }}>
            <ToggleSettingRow
              icon="sync"
              title="Sync trips"
              checked={prefs.syncTrips}
              onChange={(v) => setPref("syncTrips", v)}
            />
            <ToggleSettingRow
              icon="download"
              title="Save offline"
              sub="Keep loaded trips available without a connection"
              checked={prefs.saveOffline}
              onChange={(v) => setPref("saveOffline", v)}
            />
            <SettingRow icon="cloud" title="Last synced" sub={lastSyncedLabel()} />
          </div>

          <div className="vt-list-header">Account</div>
          <div className="vt-list" style={{ marginBottom: 16 }}>
            <SettingRow
              icon="lock"
              title="Account & security"
              sub="Password, delete account"
              onClick={() => setModal("account")}
            />
            <SettingRow
              icon="doc"
              title="Export my data"
              sub={exportData.busy ? "Preparing…" : exportData.error ?? "Download trips and settings as JSON"}
              onClick={() =>
                void exportData.trigger().then(() => {
                  if (!exportData.error) {
                    setExportToast("Export downloaded");
                    setTimeout(() => setExportToast(null), 2400);
                  }
                })
              }
            />
            <SettingRow
              icon="info"
              title="Privacy & terms"
              onClick={() => setModal("privacy")}
            />
          </div>

          <Button variant="ghost" block onClick={() => void signOut()} style={{ color: "var(--vt-destructive)" }}>
            Sign out
          </Button>
        </div>
      </div>

      {modal === "edit" && <EditProfileSheet onClose={() => setModal(null)} />}
      {modal === "appearance" && <AppearanceSheet onClose={() => setModal(null)} />}
      {modal === "currency" && <CurrencySheet onClose={() => setModal(null)} />}
      {modal === "weekstart" && <WeekStartSheet onClose={() => setModal(null)} />}
      {modal === "notifications" && <NotificationsSheet onClose={() => setModal(null)} />}
      {modal === "account" && <AccountSecuritySheet onClose={() => setModal(null)} />}
      {modal === "privacy" && <PrivacyTermsSheet onClose={() => setModal(null)} />}

      {exportToast && (
        <div className="vt-toast">
          <Icon name="check" size={16} /> {exportToast}
        </div>
      )}
    </div>
  );
}

interface SettingRowProps {
  icon: string;
  title: string;
  sub?: string;
  onClick?: () => void;
}

function SettingRow({ icon, title, sub, onClick }: SettingRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="vt-list-row"
      style={{
        border: 0,
        background: "transparent",
        font: "inherit",
        textAlign: "left",
        width: "100%",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <span className="vt-row-icon" style={{ width: 32, height: 32, borderRadius: 8 }}>
        <Icon name={icon} size={16} />
      </span>
      <div className="vt-list-row__content">
        <div className="vt-list-row__title">{title}</div>
        {sub && <div className="vt-list-row__subtitle">{sub}</div>}
      </div>
      {onClick && <Icon name="chevron" size={16} style={{ color: "var(--vt-label-quaternary)" }} />}
    </button>
  );
}

interface ToggleSettingRowProps {
  icon: string;
  title: string;
  sub?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

function ToggleSettingRow({ icon, title, sub, checked, onChange }: ToggleSettingRowProps) {
  return (
    <div className="vt-list-row">
      <span className="vt-row-icon" style={{ width: 32, height: 32, borderRadius: 8 }}>
        <Icon name={icon} size={16} />
      </span>
      <div className="vt-list-row__content">
        <div className="vt-list-row__title">{title}</div>
        {sub && <div className="vt-list-row__subtitle">{sub}</div>}
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}

function lastSyncedLabel(): string {
  const now = new Date();
  const ts = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `Just now · ${ts}`;
}
