import "dotenv/config";

export default {
  schema: "./src/backend/db/schema/index.ts",
  out: "./src/backend/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://foz:foz@localhost:5432/foz_dev",
  },
};
