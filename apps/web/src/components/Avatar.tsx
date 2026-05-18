import type { CSSProperties } from "react";
import { initials, presenceColor } from "../lib/format";

interface AvatarPerson {
  id: string;
  name: string;
}

interface AvatarProps {
  name?: string;
  size?: number;
  src?: string;
  style?: CSSProperties;
}

export function Avatar({ name, size = 32, src, style }: AvatarProps) {
  const bg = presenceColor(name ?? "?");
  const cls = `vt-avatar ${size <= 24 ? "vt-avatar--sm" : ""} ${size >= 44 ? "vt-avatar--lg" : ""}`;
  return (
    <span
      className={cls}
      style={{
        width: size,
        height: size,
        background: bg,
        fontSize: Math.round(size * 0.36),
        ...style,
      }}
    >
      {src ? (
        <img src={src} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
      ) : (
        initials(name)
      )}
    </span>
  );
}

interface AvatarStackProps {
  people: AvatarPerson[];
  max?: number;
  size?: number;
}

export function AvatarStack({ people, max = 4, size = 28 }: AvatarStackProps) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <span className="vt-avatar-stack">
      {shown.map((p) => (
        <Avatar key={p.id} name={p.name} size={size} />
      ))}
      {extra > 0 && (
        <span
          className="vt-avatar"
          style={{
            width: size,
            height: size,
            background: "var(--vt-fill-tertiary)",
            color: "var(--vt-label-secondary)",
            fontSize: Math.round(size * 0.36),
          }}
        >
          +{extra}
        </span>
      )}
    </span>
  );
}
