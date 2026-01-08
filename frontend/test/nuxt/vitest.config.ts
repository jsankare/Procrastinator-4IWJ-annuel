import { defineConfig } from "vitest/config";
import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";

/**
 * Vitest config for Nuxt integration tests
 *
 * - Targets the nuxt test folder only.
 * - Uses the Node environment because Nuxt integration tests typically
 *   interact with the server runtime (via @nuxt/test-utils).
 * - Disables worker threads for simpler lifecycle handling when starting
 *   test servers inside the same process.
 */
export default defineConfig({
  test: {
    // Include Nuxt integration tests (both .test and .spec variants)
    include: ["test/nuxt/**/*.test.{ts,js}", "test/nuxt/**/*.spec.{ts,js}"],
    environment: "node",
    globals: true,
    // Running without worker threads avoids issues with in-process test servers.
    threads: false,
    // A slightly longer default timeout for integration tests that may start a server.
    testTimeout: 30_000,
    // Ensure @nuxt/test-utils is inlined/transformed by Vitest to avoid bundling builtins like `bun:test`
    deps: {
      inline: ["@nuxt/test-utils"],
    },
  },
  // Prevent Vite SSR from externalizing @nuxt/test-utils so dynamic runtime imports can be resolved at runtime
  vite: {
    ssr: {
      noExternal: ["@nuxt/test-utils"],
    },
  },
});

/**
 * Playwright configuration for e2e tests.
 *
 * This file exports a Playwright config object so it can be imported by a Playwright runner
 * or referenced by documentation. Keeping a minimal, sensible config here:
 * - test directory is `test/e2e`
 * - default baseURL falls back to http://localhost:3000 but can be overridden with BASE_URL env var
 * - runs headless by default
 * - includes Chromium, WebKit and Firefox projects
 */
export const playwrightConfig: PlaywrightTestConfig = {
  testDir: "test/e2e",
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false,
  // Base URL used by tests if they call `page.goto('/')`
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    headless: true,
    // Capture trace on first retry to aid debugging
    trace: "on-first-retry",
    // Slow down actions when debugging locally (can be overridden)
    // actionTimeout: 0,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],
  // Optional: don't retain artifacts forever in CI
  // outputDir: 'test/e2e/test-results/'
};
