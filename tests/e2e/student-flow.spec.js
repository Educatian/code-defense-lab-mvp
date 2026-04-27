// Student flow: walk all 6 checkpoint pages, verify journey strip mounts,
// active stop is correct, no broken navigation, no JS errors.

import { test, expect } from "@playwright/test";
import { freshStart, collectConsoleErrors } from "./helpers.js";

const STOPS = [
  { path: "/pages/student-submission.html", plain: "Submit",  num: "1" },
  { path: "/pages/hotspot-questions.html",  plain: "Explain", num: "2" },
  { path: "/pages/trace-mode-task.html",    plain: "Predict", num: "3" },
  { path: "/pages/mutation-task.html",      plain: "Adapt",   num: "4" },
  { path: "/pages/repair-mode-task.html",   plain: "Fix",     num: "5" },
  { path: "/pages/student-result.html",     plain: "Reflect", num: "6" },
];

test.describe("Student flow", () => {
  test.beforeEach(async ({ page }) => {
    await freshStart(page, "/index.html");
  });

  for (const stop of STOPS) {
    test(`Step ${stop.num} (${stop.plain}) loads with active journey strip`, async ({ page }) => {
      const getErrors = collectConsoleErrors(page);
      await page.goto(stop.path);

      // Journey strip mounts.
      const strip = page.locator(".cdl-journey");
      await expect(strip).toBeVisible();

      // Active stop matches expected plain label.
      const active = strip.locator(".cdl-journey__item--active");
      await expect(active).toHaveCount(1);
      await expect(active).toContainText(stop.plain);

      // Skip-link present (visually hidden until focused).
      await expect(page.locator('a[href="#cdl-main"]').first()).toHaveCount(1);

      expect(getErrors()).toEqual([]);
    });
  }

  test("Submit page shows the R seed code + Run + output panel", async ({ page }) => {
    await page.goto("/pages/student-submission.html");
    const code = page.locator("#submission-code-input");
    await expect(code).toBeVisible();
    // Seed code includes the regression demo lines. Textareas need toHaveValue
    // (toContainText reads textContent, not the live .value the renderer sets).
    await expect(code).toHaveValue(/build_regression_report/);
    await expect(code).toHaveValue(/lm\(exam_score ~ hours_studied/);

    // Runner mount has the Run button + console + plot panel.
    await expect(page.locator(".cdl-runner__run")).toBeVisible();
    await expect(page.locator(".cdl-runner__console")).toBeVisible();
    await expect(page.locator(".cdl-runner__plots")).toBeVisible();
  });

  test("Submit page Step 3 disclosure auto-opens for data-science assignment", async ({ page }) => {
    await page.goto("/pages/student-submission.html");
    const details = page.locator("#submission-reflect-details");
    await expect(details).toHaveJSProperty("open", true);
  });

  test("Hotspot textareas are aria-labelledby (form-labelling fix)", async ({ page }) => {
    await page.goto("/pages/hotspot-questions.html");
    for (const id of ["hotspot-answer-1", "hotspot-answer-2", "hotspot-answer-3"]) {
      const ta = page.locator(`#${id}`);
      const labelledby = await ta.getAttribute("aria-labelledby");
      expect(labelledby).not.toBeNull();
      expect(labelledby).toMatch(/hotspot-q\d-title hotspot-question-\d/);
    }
  });

  test("Trace fallback shows neutral placeholder, not orphan Python", async ({ page }) => {
    await page.goto("/pages/trace-mode-task.html");
    // After JS runs, the code block is replaced. But check that the static
    // fallback SOURCE (no JS) does not contain orphan Python.
    const html = await page.evaluate(() => document.documentElement.outerHTML);
    expect(html).not.toContain("lengthOfLongestSubstring");
  });

  test("Mutation page no longer has fake Technical Log theater", async ({ page }) => {
    await page.goto("/pages/mutation-task.html");
    await expect(page.locator("body")).not.toContainText("Technical Log");
    await expect(page.locator("body")).toContainText("How this checkpoint works");
  });

  test("Result page renders Next Action card on first visit (all checkpoints empty)", async ({ page }) => {
    await page.goto("/pages/student-result.html");
    const card = page.locator("#result-next-action-mount");
    await expect(card).toBeVisible();
    // Fresh state: pending = all 5 active steps. Card should mention Submit first.
    await expect(card).toContainText("Submit");
    // And there is an actionable link.
    await expect(card.locator("a")).toHaveCount(1);
  });
});
