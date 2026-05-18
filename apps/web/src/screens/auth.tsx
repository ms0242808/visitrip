import { useState, type ReactNode } from "react";
import { Button, Field, Input } from "../components/ui";
import { BrandMark } from "../components/Brand";
import { useAuth } from "../lib/auth";

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
  onSwitch: () => void;
  onForgot: () => void;
  inviteBanner?: boolean;
}

export function SignIn({ onSwitch, onForgot, inviteBanner }: SignInProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={inviteBanner ? "Sign in to join the trip" : "Welcome back"}
      sub={
        inviteBanner
          ? "We'll bring you right back to the invite once you sign in."
          : "Pick up where you left off. Your trips are waiting."
      }
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
          <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </Field>
        <Field label="Password">
          <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </Field>
        <div style={{ textAlign: "right" }}>
          <a onClick={onForgot} style={{ fontSize: 13, color: "var(--vt-accent)", fontWeight: 600, cursor: "pointer" }}>
            Forgot password?
          </a>
        </div>
        {error && <div style={{ fontSize: 13, color: "var(--vt-destructive)" }}>{error}</div>}
        <Button type="submit" variant="primary" size="lg" block loading={loading}>
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}

interface SignUpProps {
  onSwitch: () => void;
  inviteBanner?: boolean;
}

export function SignUp({ onSwitch, inviteBanner }: SignUpProps) {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signUp(email, password, name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-up failed");
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={inviteBanner ? "Create an account to join" : "Plan trips together"}
      sub={
        inviteBanner
          ? "Sign up and we'll drop you straight onto the trip."
          : "Free for the first 3 trips. No credit card."
      }
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
        onSubmit={submit}
        style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 360, margin: "0 auto" }}
      >
        <Field label="Your name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mira Castellan" required />
        </Field>
        <Field label="Email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        </Field>
        <div style={{ fontSize: 12, color: "var(--vt-label-tertiary)", lineHeight: 1.5 }}>
          By continuing, you agree to the <a style={{ color: "var(--vt-accent)" }}>Terms</a> and{" "}
          <a style={{ color: "var(--vt-accent)" }}>Privacy Policy</a>.
        </div>
        {error && <div style={{ fontSize: 13, color: "var(--vt-destructive)" }}>{error}</div>}
        <Button type="submit" variant="primary" size="lg" block loading={loading}>
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
