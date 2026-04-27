// Playwright config — auto-launches the Vite dev server, runs Chromium only.
// Single-browser is fine for this MVP; we're testing functional flow + sync,
// not cross-browser rendering.

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  // Each test gets its own clean storageState by default — important for the
  // sync spec that explicitly shares state across pages.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false, // localStorage in our app is shared; serialize.
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: {
    command: "npx vite --port 4173 --host 127.0.0.1",
    url: "http://127.0.0.1:4173/index.html",
    reuseExistingServer: true,
    timeout: 60_000,
    stdout: "ignore",
    stderr: "pipe",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
