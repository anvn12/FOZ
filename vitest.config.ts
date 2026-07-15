import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: [
      "src/backend/lib/**/*.test.ts",
      "src/backend/api/**/*.test.ts",
      "src/backend/__tests__/integration/**/*.test.ts",
      "src/shared/**/*.test.ts",
    ],
    setupFiles: ["src/backend/__tests__/setup.ts"],
    fileParallelism: false,
    pool: "forks",
    testTimeout: 5000,
  },
  resolve: {
    alias: {
      "#shared": fileURLToPath(new URL("./src/shared", import.meta.url)),
      "#backend": fileURLToPath(new URL("./src/backend", import.meta.url)),
      "#frontend": fileURLToPath(new URL("./src/frontend/src", import.meta.url)),
    },
  },
});
