import { Icon } from "./Icon";

interface BrandMarkProps {
  size?: number;
  color?: string;
}

export function BrandMark({ size = 32, color }: BrandMarkProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        background: color ?? "var(--vt-accent)",
        color: "var(--vt-on-accent)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 16px color-mix(in oklch, var(--vt-accent) 32%, transparent)",
      }}
    >
      <Icon name="logo" size={size * 0.62} strokeWidth={1.8} />
    </div>
  );
}

interface WordmarkProps {
  size?: number;
}

export function Wordmark({ size = 22 }: WordmarkProps) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <BrandMark size={size + 4} />
      <span style={{ fontWeight: 700, fontSize: size, letterSpacing: "-0.022em" }}>Visitrip</span>
    </div>
  );
}
