export * from "./schema";

export const databaseDialect = "postgresql" as const;
export const databaseMigrationsPath = "src/backend/db/migrations" as const;
