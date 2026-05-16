import { useState } from "react";
import { Button } from "../components/ui";

interface OnboardingScreenProps {
  onDone: () => void;
}

export function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const [step, setStep] = useState(0);
  const steps = [
    {
      title: "Plan trips together",
      sub: "Build itineraries side-by-side with friends. Everyone sees the same plan, in real time.",
      art: <ArtPlan />,
    },
    {
      title: "Itineraries that breathe",
      sub: "Drag, drop, re-order. Times shift, the rest of the day moves with them.",
      art: <ArtItin />,
    },
    {
      title: "Works offline",
      sub: "Boarding passes, addresses, packing lists — always available, even without signal.",
      art: <ArtOffline />,
    },
  ];
  const current = steps[step]!;
  return (
    <div className="vt-screen" style={{ background: "var(--vt-bg)" }}>
      <div className="vt-scroll" style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "64px 24px 24px",
            textAlign: "center",
            gap: 32,
          }}
        >
          <div style={{ width: 220, height: 220 }}>{current.art}</div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>{current.title}</div>
            <div style={{ fontSize: 15, color: "var(--vt-label-tertiary)", marginTop: 10, maxWidth: 300, lineHeight: 1.5 }}>
              {current.sub}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === step ? 22 : 7,
                  height: 7,
                  borderRadius: 4,
                  background: i === step ? "var(--vt-accent)" : "var(--vt-fill-tertiary)",
                  transition: "width 240ms var(--vt-ease-out)",
                }}
              />
            ))}
          </div>
        </div>
        <div style={{ padding: "0 24px 32px", display: "flex", flexDirection: "column", gap: 8 }}>
          {step < steps.length - 1 ? (
            <Button variant="primary" size="lg" block iconAfter="arrow" onClick={() => setStep(step + 1)}>
              Continue
            </Button>
          ) : (
            <Button variant="primary" size="lg" block onClick={onDone}>
              Get started
            </Button>
          )}
          <Button variant="ghost" block onClick={onDone}>
            Skip
          </Button>
        </div>
      </div>
    </div>
  );
}

function ArtPlan() {
  return (
    <svg viewBox="0 0 220 220" width="100%" height="100%">
      <rect x="20" y="30" width="180" height="160" rx="22" fill="var(--vt-bg-grouped-elev)" stroke="var(--vt-separator-opaque)" />
      <rect x="38" y="48" width="100" height="14" rx="4" fill="var(--vt-fill-tertiary)" />
      <rect x="38" y="74" width="144" height="10" rx="3" fill="var(--vt-fill-quaternary)" />
      <rect x="38" y="92" width="120" height="10" rx="3" fill="var(--vt-fill-quaternary)" />
      <circle cx="50" cy="146" r="14" fill="var(--vt-presence-1)" />
      <circle cx="74" cy="146" r="14" fill="var(--vt-presence-2)" stroke="var(--vt-bg-grouped-elev)" strokeWidth="3" />
      <circle cx="98" cy="146" r="14" fill="var(--vt-presence-3)" stroke="var(--vt-bg-grouped-elev)" strokeWidth="3" />
      <circle cx="122" cy="146" r="14" fill="var(--vt-presence-4)" stroke="var(--vt-bg-grouped-elev)" strokeWidth="3" />
      <rect x="38" y="170" width="60" height="10" rx="3" fill="var(--vt-accent)" />
    </svg>
  );
}

function ArtItin() {
  return (
    <svg viewBox="0 0 220 220" width="100%" height="100%">
      <line x1="40" y1="30" x2="40" y2="200" stroke="var(--vt-separator-opaque)" strokeWidth="2" />
      {[40, 90, 140, 180].map((y, i) => (
        <g key={i}>
          <circle cx="40" cy={y} r="6" fill={i === 0 ? "var(--vt-accent)" : "var(--vt-bg)"} stroke="var(--vt-accent)" strokeWidth="2" />
          <rect x="60" y={y - 16} width="140" height="32" rx="10" fill="var(--vt-bg-elev)" stroke="var(--vt-separator-opaque)" />
          <rect x="72" y={y - 8} width={[80, 100, 60, 90][i]} height="6" rx="2" fill="var(--vt-label)" opacity="0.55" />
          <rect x="72" y={y + 2} width={[50, 80, 90, 60][i]} height="4" rx="2" fill="var(--vt-label)" opacity="0.25" />
        </g>
      ))}
    </svg>
  );
}

function ArtOffline() {
  return (
    <svg viewBox="0 0 220 220" width="100%" height="100%">
      <circle cx="110" cy="110" r="80" fill="var(--vt-accent-tint)" />
      <rect x="60" y="60" width="100" height="130" rx="14" fill="var(--vt-bg-elev)" stroke="var(--vt-separator-opaque)" />
      <rect x="74" y="76" width="72" height="8" rx="3" fill="var(--vt-label)" opacity="0.6" />
      <rect x="74" y="92" width="60" height="6" rx="2" fill="var(--vt-label)" opacity="0.3" />
      <rect x="74" y="120" width="72" height="50" rx="6" fill="var(--vt-fill-tertiary)" />
      <g transform="translate(140 50)">
        <circle r="22" fill="var(--vt-bg)" stroke="var(--vt-accent)" strokeWidth="2" />
        <path
          d="M-10 -2 a14 14 0 0 1 20 0 M-7 4 a7 7 0 0 1 14 0"
          fill="none"
          stroke="var(--vt-accent)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line x1="-14" y1="-14" x2="14" y2="14" stroke="var(--vt-accent)" strokeWidth="2.4" strokeLinecap="round" />
      </g>
    </svg>
  );
}
