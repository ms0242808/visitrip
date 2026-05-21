import type { Auth } from "./auth";

export interface Deps {
  auth: Auth;
  webOrigin: string;
}
