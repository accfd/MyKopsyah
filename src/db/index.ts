import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

export const isDbConfigured = Boolean(
  connectionString &&
  (connectionString.startsWith("postgres://") || connectionString.startsWith("postgresql://")) &&
  !connectionString.includes("user:password@ep-sample")
);

export const db = isDbConfigured
  ? drizzle(neon(connectionString!), { schema })
  : (null as unknown as ReturnType<typeof drizzle>);

export { schema };
