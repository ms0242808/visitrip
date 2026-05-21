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
