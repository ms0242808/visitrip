import { type AnyD1Database, type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "./schema-d1.ts";

export function createD1Db(binding: AnyD1Database) {
  return drizzle(binding, { schema });
}

export type Db = DrizzleD1Database<typeof schema>;
export { schema };
export * from "./schema-d1.ts";
