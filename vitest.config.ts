import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    globals: true,
    environmentMatchGlobs: [
      ["src/backend/**/*.test.ts", "node"],
      ["src/frontend/src/**/*.test.{ts,tsx}", "jsdom"],
      ["src/shared/**/*.test.ts", "node"],
    ],
    include: [
      "src/backend/lib/**/*.test.ts",
      "src/backend/api/**/*.test.ts",
      "src/backend/__tests__/unit/**/*.test.ts",
      "src/backend/__tests__/integration/**/*.test.ts",
      "src/shared/**/*.test.ts",
      "src/frontend/src/**/*.test.{ts,tsx}",
    ],
    setupFiles: [
      "src/backend/__tests__/setup.ts",
      "src/frontend/src/test/setup.ts",
    ],
    fileParallelism: false,
    pool: "forks",
    testTimeout: 5000,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src/frontend/src", import.meta.url)),
      "#shared": fileURLToPath(new URL("./src/shared", import.meta.url)),
      "#backend": fileURLToPath(new URL("./src/backend", import.meta.url)),
      "#frontend": fileURLToPath(new URL("./src/frontend/src", import.meta.url)),
    },
  },
});
