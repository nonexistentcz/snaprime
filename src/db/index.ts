import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "cloudflare:workers";
import * as brandSchema from "./schema/brand";
import * as advertSchema from "./schema/advert";
import * as advertImageSchema from "./schema/advert-image";

const schema = { ...brandSchema, ...advertSchema, ...advertImageSchema };

function createDb() {
  const connectionString =
    env.HYPERDRIVE?.connectionString ??
    `postgres://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASSWORD!)}@${process.env.DB_HOST}:${process.env.DB_PORT ?? 5432}/${process.env.DB_NAME}`;

  const client = postgres(connectionString, { prepare: false });
  return drizzle(client, { schema });
}

// Hyperdrive pools connections on Cloudflare's side, so a fresh client per
// access is fast and required — Workers cannot reuse a connection across
// requests, and this Proxy defers construction out of module/global scope.
export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_target, prop, receiver) {
    return Reflect.get(createDb(), prop, receiver);
  },
});
