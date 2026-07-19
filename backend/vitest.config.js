import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: "./src/test/setup.js",
    include: ["src/**/*.{test,spec}.js"],
    pool: "forks",
    fileParallelism: false,
    maxWorkers: 1,
    minWorkers: 1,
    // The in-memory MongoDB binary can take a while to download/boot on first run.
    hookTimeout: 120000,
    testTimeout: 30000,
  },
});
