import { useState, type ReactNode } from "react";
import { Button, Field, Input } from "../components/ui";
import { BrandMark } from "../components/Brand";

interface AuthShellProps {
  title: ReactNode;
  sub?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

function AuthShell({ children, title, sub, footer }: AuthShellProps) {
  return (
    <div className="vt-screen" style={{ background: "var(--vt-bg)" }}>
      <div className="vt-scroll" style={{ padding: "60px 24px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 32 }}>
          <BrandMark size={48} />
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.022em", marginTop: 16 }}>{title}</div>
          {sub && (
            <div
              style={{
                fontSize: 15,
                color: "var(--vt-label-tertiary)",
                textAlign: "center",
                maxWidth: 280,
                lineHeight: 1.45,
              }}
            >
              {sub}
            </div>
          )}
        </div>
        {children}
      </div>
      {footer && (
        <div
          style={{
            padding: "16px 24px 28px",
            textAlign: "center",
            fontSize: 14,
            color: "var(--vt-label-tertiary)",
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

interface SignInProps {
  onSubmit: () => void;
  onSwitch: () => void;
  onForgot: () => void;
}

export function SignIn({ onSubmit, onSwitch, onForgot }: SignInProps) {
  const [email, setEmail] = useState("mira@castellan.studio");
  const [password, setPassword] = useState("••••••••");
  const [loading, setLoading] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSubmit();
    }, 700);
  };
  return (
    <AuthShell
      title="Welcome back"
      sub="Pick up where you left off. Your trips are waiting."
      footer={
        <>
          New here?{" "}
          <a onClick={onSwitch} style={{ color: "var(--vt-accent)", fontWeight: 600, cursor: "pointer" }}>
            Create an account
          </a>
        </>
      }
    >
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 360, margin: "0 auto" }}>
        <Field label="Email">
          <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </Field>
        <Field label="Password">
          <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </Field>
        <div style={{ textAlign: "right" }}>
          <a onClick={onForgot} style={{ fontSize: 13, color: "var(--vt-accent)", fontWeight: 600, cursor: "pointer" }}>
            Forgot password?
          </a>
        </div>
        <Button type="submit" variant="primary" size="lg" block loading={loading}>
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}

interface SignUpProps {
  onSubmit: () => void;
  onSwitch: () => void;
}

export function SignUp({ onSubmit, onSwitch }: SignUpProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  return (
    <AuthShell
      title="Plan trips together"
      sub="Free for the first 3 trips. No credit card."
      footer={
        <>
          Already have an account?{" "}
          <a onClick={onSwitch} style={{ color: "var(--vt-accent)", fontWeight: 600, cursor: "pointer" }}>
            Sign in
          </a>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 360, margin: "0 auto" }}
      >
        <Field label="Your name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mira Castellan" />
        </Field>
        <Field label="Email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </Field>
        <Field label="Password" hint="At least 10 characters.">
          <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
        </Field>
        <div style={{ fontSize: 12, color: "var(--vt-label-tertiary)", lineHeight: 1.5 }}>
          By continuing, you agree to the <a style={{ color: "var(--vt-accent)" }}>Terms</a> and{" "}
          <a style={{ color: "var(--vt-accent)" }}>Privacy Policy</a>.
        </div>
        <Button type="submit" variant="primary" size="lg" block>
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}

interface VerifyProps {
  email: string;
  onSubmit: () => void;
  onBack: () => void;
}

export function Verify({ email, onSubmit, onBack }: VerifyProps) {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const refs: Array<HTMLInputElement | null> = [];
  const setAt = (i: number, v: string) => {
    const c = [...code];
    c[i] = v.slice(-1);
    setCode(c);
    if (v && i < 5) refs[i + 1]?.focus();
  };
  return (
    <AuthShell
      title="Check your email"
      sub={
        <>
          We sent a 6-digit code to <b style={{ color: "var(--vt-label)" }}>{email}</b>
        </>
      }
    >
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
        {code.map((c, i) => (
          <input
            key={i}
            ref={(el) => {
              refs[i] = el;
            }}
            value={c}
            onChange={(e) => setAt(i, e.target.value)}
            inputMode="numeric"
            maxLength={1}
            className="vt-input"
            style={{ width: 44, height: 56, textAlign: "center", fontSize: 22, fontWeight: 600, padding: 0 }}
          />
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 360, margin: "0 auto" }}>
        <Button variant="primary" size="lg" block onClick={onSubmit}>
          Verify
        </Button>
        <Button variant="ghost" block onClick={onBack}>
          Wrong email? Go back
        </Button>
        <div style={{ textAlign: "center", fontSize: 13, color: "var(--vt-label-tertiary)", marginTop: 6 }}>
          Didn't get it?{" "}
          <a style={{ color: "var(--vt-accent)", fontWeight: 600, cursor: "pointer" }}>Resend in 0:42</a>
        </div>
      </div>
    </AuthShell>
  );
}
