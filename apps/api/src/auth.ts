import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { schema } from "@visitrip/db";

export interface AuthConfig {
  db: Parameters<typeof drizzleAdapter>[0];
  provider: "pg" | "sqlite";
  secret: string;
  baseURL: string;
  trustedOrigins: string[];
}

// Cloudflare Workers' free tier caps each request at 10 ms of CPU. better-auth's
// default scrypt hashing is pure-JS and easily blows past that. PBKDF2 via
// crypto.subtle is implemented natively in workerd (and Node 20+) and runs in
// ~1 ms for 100k iterations, well inside the budget.
const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const HASH_BYTES = 32;
const ENCODER = new TextEncoder();

async function derive(password: string, salt: Uint8Array, iterations: number, lengthBytes: number) {
  const key = await crypto.subtle.importKey("raw", ENCODER.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    key,
    lengthBytes * 8,
  );
  return new Uint8Array(bits);
}

function b64(bytes: Uint8Array) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

function unb64(s: string) {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await derive(password, salt, PBKDF2_ITERATIONS, HASH_BYTES);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${b64(salt)}$${b64(hash)}`;
}

async function verifyPassword({ password, hash }: { password: string; hash: string }): Promise<boolean> {
  const parts = hash.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  if (!Number.isFinite(iterations) || iterations < 1) return false;
  const salt = unb64(parts[2]!);
  const expected = unb64(parts[3]!);
  const actual = await derive(password, salt, iterations, expected.length);
  return timingSafeEqual(actual, expected);
}

export function createAuth(cfg: AuthConfig) {
  if (!cfg.secret) throw new Error("BETTER_AUTH_SECRET is required");
  return betterAuth({
    database: drizzleAdapter(cfg.db, {
      provider: cfg.provider,
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      minPasswordLength: 8,
      password: { hash: hashPassword, verify: verifyPassword },
    },
    user: {
      deleteUser: { enabled: true },
    },
    secret: cfg.secret,
    baseURL: cfg.baseURL,
    trustedOrigins: cfg.trustedOrigins,
  });
}

export type Auth = ReturnType<typeof createAuth>;
export type AuthSession = NonNullable<Awaited<ReturnType<Auth["api"]["getSession"]>>>;

let _auth: Auth | null = null;

export function setAuth(a: Auth) {
  _auth = a;
}

export const auth = new Proxy({} as Auth, {
  get(_target, prop) {
    if (!_auth) throw new Error("auth accessed before setAuth()");
    const value = Reflect.get(_auth as object, prop);
    return typeof value === "function" ? value.bind(_auth) : value;
  },
});
