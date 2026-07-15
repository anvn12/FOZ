// Test setup — load env first, before any other imports.
process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.DATABASE_URL = process.env.DATABASE_URL ?? "postgres://foz:foz@localhost:5432/foz_test";
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "test-secret-must-be-at-least-16-chars";
process.env.JWT_ACCESS_TTL_MIN = process.env.JWT_ACCESS_TTL_MIN ?? "15";
process.env.REFRESH_TTL_DAYS = process.env.REFRESH_TTL_DAYS ?? "7";
process.env.BCRYPT_COST = process.env.BCRYPT_COST ?? "4"; // tests run bcrypt at the lowest cost
process.env.COOKIE_SECURE = process.env.COOKIE_SECURE ?? "false";
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";
