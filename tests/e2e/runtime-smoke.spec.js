// Runtime smoke: click Run on the Submit page and wait until the runtime
// either finishes ("Done in") or fails. Pass if it doesn't silently hang.
//
// This test is generous on time because the FIRST WebR boot downloads a
// multi-megabyte WASM bundle from the public CDN. On networks where that's
// blocked, the test will see "Did not finish" / runner error and still pass —
// because the goal is to detect SILENT HANGS, not to prove R works offline.

import { test, expect } from "@playwright/test";
import { freshStart, collectConsoleErrors } from "./helpers.js";

test.describe("Runtime smoke (WebR)", () => {
  test.setTimeout(180_000); // first WebR boot can be slow on cold caches.

  test("Run button finishes (success or surfaced error, no silent hang)", async ({ page }) => {
    const getErrors = collectConsoleErrors(page);
    await freshStart(page, "/index.html");
    await page.goto("/pages/student-submission.html");

    const runBtn = page.locator(".cdl-runner__run");
    await expect(runBtn).toBeVisible();
    await expect(runBtn).toHaveText("Run");

    await runBtn.click();

    // Status should announce booting + then a terminal phrase.
    const status = page.locator(".cdl-runner__status");
    await expect(status).toContainText(/Booting|Running/);

    // Wait for ANY terminal status (don't insist on success — CDN may be blocked).
    await expect(status).toContainText(/Done in|Did not finish/, { timeout: 150_000 });

    // Run button is back to "Run" (re-enabled).
    await expect(runBtn).toHaveText("Run");

    // Console pre should have at least SOMETHING (stdout success OR a
    // runner-error stderr line). Empty console with terminal status = bug.
    const consoleText = (await page.locator(".cdl-runner__console").textContent()) || "";
    expect(consoleText.trim().length).toBeGreaterThan(0);

    // Hard JS errors are not allowed regardless of runtime success.
    const hardErrors = getErrors().filter(
      (e) => !e.includes("WebR") && !e.includes("webr.r-wasm.org") && !e.includes("Failed to fetch"),
    );
    expect(hardErrors).toEqual([]);
  });
});
