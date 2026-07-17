// Test setup — env vars must be set BEFORE any module loads (so env.ts sees them).
process.env.NODE_ENV = "test";
process.env.TEST_DATABASE_URL = "postgres://foz:foz@localhost:5432/foz_test";
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.JWT_ACCESS_SECRET = "test-secret-must-be-at-least-16-chars";
process.env.JWT_ACCESS_TTL_MIN = "15";
process.env.REFRESH_TTL_DAYS = "7";
process.env.BCRYPT_COST = "4"; // tests run bcrypt at the lowest cost
process.env.COOKIE_SECURE = "false";
process.env.CORS_ORIGIN = "http://localhost:5173";
