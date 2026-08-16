import { describe, it, expect } from "vitest";
import { assertIsTestDatabase, getDatabaseName } from "../test-db-guard.js";

describe("Test Database Safety Guardrail", () => {
  it("should extract database name correctly from connection URLs", () => {
    expect(getDatabaseName("postgres://foz:foz@localhost:5432/foz_test_empty")).toBe("foz_test_empty");
    expect(getDatabaseName("postgres://foz:foz@localhost:5432/foz_test_populated?sslmode=disable")).toBe("foz_test_populated");
    expect(getDatabaseName("postgres://foz:foz@localhost:5432/foz_dev")).toBe("foz_dev");
  });

  it("should allow valid test databases without throwing", () => {
    expect(() => assertIsTestDatabase("postgres://foz:foz@localhost:5432/foz_test_empty")).not.toThrow();
    expect(() => assertIsTestDatabase("postgres://foz:foz@localhost:5432/foz_test_populated")).not.toThrow();
    expect(() => assertIsTestDatabase("postgres://foz:foz@localhost:5432/foz_test")).not.toThrow();
    expect(() => assertIsTestDatabase("postgres://user:pass@remote:5432/my_feature_test_db")).not.toThrow();
  });

  it("should block and throw on development or production databases", () => {
    expect(() => assertIsTestDatabase("postgres://foz:foz@localhost:5432/foz_dev")).toThrow(/CRITICAL SAFETY ERROR/);
    expect(() => assertIsTestDatabase("postgres://foz:foz@localhost:5432/postgres")).toThrow(/CRITICAL SAFETY ERROR/);
    expect(() => assertIsTestDatabase("postgres://foz:foz@localhost:5432/foz")).toThrow(/CRITICAL SAFETY ERROR/);
    expect(() => assertIsTestDatabase("postgres://admin:pass@production-db:5432/foz_live")).toThrow(/CRITICAL SAFETY ERROR/);
  });
});
