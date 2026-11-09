import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Test config for the template harness. Templates are pure prop→markup
 * components, so we render them with react-dom/server in a plain node
 * environment — no jsdom needed. `tsconfigPaths` wires up the "@/*" alias.
 */
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
