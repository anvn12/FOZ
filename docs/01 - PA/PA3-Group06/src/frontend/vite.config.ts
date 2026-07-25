import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      "#shared": fileURLToPath(new URL("../shared", import.meta.url)),
      "#frontend": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api/v1": "http://localhost:4000",
      "/health": "http://localhost:4000",
    },
  },
});
