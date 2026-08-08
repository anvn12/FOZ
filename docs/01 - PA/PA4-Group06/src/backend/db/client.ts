import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "#backend/env";
import * as schema from "./schema/index.js";

const queryClient = postgres(env.DATABASE_URL, { max: 10 });

export const db = drizzle(queryClient, { schema });
export type Db = typeof db;
export { queryClient as pgClient };
