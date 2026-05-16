import { useState } from "react";
import { ME } from "../data/seed";
import { Avatar } from "../components/Avatar";
import { Icon } from "../components/Icon";
import { Badge, Button, IconButton, NavBar, Switch } from "../components/ui";

interface ProfileScreenProps {
  onSignOut: () => void;
  onBack?: () => void;
}

export function ProfileScreen({ onSignOut, onBack }: ProfileScreenProps) {
  return (
    <div className="vt-screen vt-screen-grouped">
      <NavBar leading={onBack ? <IconButton name="chevronL" onClick={onBack} /> : null} title="You" />
      <div className="vt-scroll" style={{ padding: "16px 16px 100px" }}>
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
          <Avatar name={ME.name} size={56} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 600 }}>{ME.name}</div>
            <div style={{ fontSize: 13, color: "var(--vt-label-tertiary)" }}>mira@castellan.studio</div>
            <Badge variant="accent" style={{ marginTop: 6 }}>
              Free · 1 of 3 trips
            </Badge>
          </div>
          <IconButton name="edit" />
        </div>

        <div className="vt-list-header">Preferences</div>
        <div className="vt-list" style={{ marginBottom: 16 }}>
          <SettingRow icon="sun" title="Appearance" sub="Auto · matches your device" rightChevron />
          <SettingRow icon="globe" title="Default currency" sub="EUR · €" rightChevron />
          <SettingRow icon="calendar" title="Week starts on" sub="Monday" rightChevron />
          <SettingRow icon="bell" title="Notifications" sub="Trip updates, expenses" rightChevron />
        </div>

        <div className="vt-list-header">Sync</div>
        <div className="vt-list" style={{ marginBottom: 16 }}>
          <SettingRow icon="sync" title="Sync trips" toggle defaultOn />
          <SettingRow icon="download" title="Save offline" sub="On Wi-Fi only" toggle defaultOn />
          <SettingRow icon="cloud" title="Last synced" sub="Just now · 2 minutes ago" />
        </div>

        <div className="vt-list-header">Account</div>
        <div className="vt-list" style={{ marginBottom: 16 }}>
          <SettingRow icon="user" title="Account & security" rightChevron />
          <SettingRow icon="doc" title="Export my data" rightChevron />
          <SettingRow icon="info" title="Privacy & terms" rightChevron />
        </div>

        <Button variant="ghost" block onClick={onSignOut} style={{ color: "var(--vt-destructive)" }}>
          Sign out
        </Button>
        <div
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "var(--vt-label-quaternary)",
            marginTop: 20,
          }}
        >
          Visitrip · v0.4.0 (mockup)
        </div>
      </div>
    </div>
  );
}

interface SettingRowProps {
  icon: string;
  title: string;
  sub?: string;
  rightChevron?: boolean;
  toggle?: boolean;
  defaultOn?: boolean;
}

function SettingRow({ icon, title, sub, rightChevron, toggle, defaultOn }: SettingRowProps) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="vt-list-row" style={{ cursor: rightChevron || toggle ? "pointer" : "default" }}>
      <span
        className="vt-row-icon"
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "var(--vt-fill-tertiary)",
          color: "var(--vt-label-secondary)",
        }}
      >
        <Icon name={icon} size={16} />
      </span>
      <div className="vt-list-row__content">
        <div className="vt-list-row__title">{title}</div>
        {sub && <div className="vt-list-row__subtitle">{sub}</div>}
      </div>
      {toggle && <Switch checked={on} onChange={setOn} />}
      {rightChevron && <Icon name="chevron" size={16} style={{ color: "var(--vt-label-quaternary)" }} />}
    </div>
  );
}
