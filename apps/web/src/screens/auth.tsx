import { useState, type ReactNode } from "react";
import { useAuth } from "../lib/auth";

interface ForgotPasswordProps {
  onBack: () => void;
}

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <AuthShell
      title={submitted ? "Check your inbox" : "Reset your password"}
      sub={
        submitted ? (
          <>
            If an account exists for <b style={{ color: "var(--c-ink)" }}>{email}</b>, we sent a link to
            reset the password. The link expires in 30 minutes.
          </>
        ) : (
          "Enter the email you signed up with and we'll send a reset link."
        )
      }
      footer={
        <a onClick={onBack} style={{ color: "var(--c-accent)", fontWeight: 600, cursor: "pointer" }}>
          Back to sign in
        </a>
      }
    >
      {submitted ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button className="btn-pri" style={{ width: "100%" }} onClick={onBack}>
            Done
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <Field label="Email">
            <input
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </Field>
          <div style={{ fontSize: 12, color: "var(--c-ink-3)", lineHeight: 1.5 }}>
            Email delivery for resets isn't wired up yet — this is a placeholder. The reset link will go out
            once an email provider is configured in the backend.
          </div>
          <button type="submit" className="btn-pri" style={{ width: "100%" }}>
            Send reset link
          </button>
        </form>
      )}
    </AuthShell>
  );
}

interface AuthShellProps {
  title: ReactNode;
  sub?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

function AuthShell({ children, title, sub, footer }: AuthShellProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--c-bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "60px 24px 24px",
          width: "100%",
          maxWidth: 420,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "var(--c-ink)",
              color: "var(--c-bg)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--sf-display)",
              fontSize: 30,
              fontStyle: "italic",
            }}
          >
            T
          </div>
          <h1
            className="large-title"
            style={{ marginTop: 16, textAlign: "center", fontSize: 36 }}
          >
            {title}
          </h1>
          {sub && (
            <div
              style={{
                fontSize: 14,
                color: "var(--c-ink-3)",
                textAlign: "center",
                maxWidth: 320,
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
            color: "var(--c-ink-3)",
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

function Field({ label, children, hint }: { label: ReactNode; children: ReactNode; hint?: ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: 0.06,
          textTransform: "uppercase",
          color: "var(--c-ink-3)",
        }}
      >
        {label}
      </span>
      {children}
      {hint && <span style={{ fontSize: 12, color: "var(--c-ink-3)" }}>{hint}</span>}
    </label>
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
          <a onClick={onSwitch} style={{ color: "var(--c-accent)", fontWeight: 600, cursor: "pointer" }}>
            Create an account
          </a>
        </>
      }
    >
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Email">
          <input
            className="input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </Field>
        <Field label="Password">
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </Field>
        <div style={{ textAlign: "right" }}>
          <a
            onClick={onForgot}
            style={{ fontSize: 13, color: "var(--c-accent)", fontWeight: 600, cursor: "pointer" }}
          >
            Forgot password?
          </a>
        </div>
        {error && <div style={{ fontSize: 13, color: "var(--c-accent)" }}>{error}</div>}
        <button type="submit" className="btn-pri" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
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
          <a onClick={onSwitch} style={{ color: "var(--c-accent)", fontWeight: 600, cursor: "pointer" }}>
            Sign in
          </a>
        </>
      }
    >
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Your name">
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mira Castellan"
            required
          />
        </Field>
        <Field label="Email">
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </Field>
        <div style={{ fontSize: 12, color: "var(--c-ink-3)", lineHeight: 1.5 }}>
          By continuing, you agree to the <a style={{ color: "var(--c-accent)" }}>Terms</a> and{" "}
          <a style={{ color: "var(--c-accent)" }}>Privacy Policy</a>.
        </div>
        {error && <div style={{ fontSize: 13, color: "var(--c-accent)" }}>{error}</div>}
        <button type="submit" className="btn-pri" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
