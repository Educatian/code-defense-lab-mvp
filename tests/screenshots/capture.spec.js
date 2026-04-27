// Screenshot capture for the README. Not a test of behavior — just a way to
// keep `docs/screenshots/*.png` in lockstep with the live UI.
//
// Run via:  npx playwright test tests/screenshots/capture.spec.js
// or:       npm run capture:screenshots
//
// Output:   docs/screenshots/01-landing.png ... etc.

import { test, expect } from "@playwright/test";
import { freshStart } from "../e2e/helpers.js";

const VIEWPORT = { width: 1440, height: 900 };
const OUT = (n) => `docs/screenshots/${n}`;

const STUDENT_PAGES = [
  { path: "/index.html",                      file: "01-landing.png" },
  { path: "/pages/student-portal.html",       file: "02-student-portal.png" },
  { path: "/pages/student-submission.html",   file: "03-submit.png" },
  { path: "/pages/hotspot-questions.html",    file: "04-explain.png" },
  { path: "/pages/trace-mode-task.html",      file: "05-predict.png" },
  { path: "/pages/mutation-task.html",        file: "06-adapt.png" },
  { path: "/pages/repair-mode-task.html",     file: "07-fix.png" },
  { path: "/pages/student-result.html",       file: "08-reflect-fresh.png" },
];

const PROFESSOR_PAGES = [
  { path: "/pages/professor-dashboard.html",        file: "09-professor-dashboard.png" },
  { path: "/pages/create-assignment.html",          file: "10-create-assignment.png" },
  { path: "/pages/professor-student-detail.html",   file: "11-professor-detail.png" },
];

test.describe.configure({ mode: "serial" });

test.describe("Capture screenshots", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORT);
  });

  for (const { path, file } of STUDENT_PAGES) {
    test(`student: ${file}`, async ({ page }) => {
      await freshStart(page, "/index.html");
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(400); // small settle for layout transitions
      await page.screenshot({ path: OUT(file), fullPage: false });
    });
  }

  for (const { path, file } of PROFESSOR_PAGES) {
    test(`professor: ${file}`, async ({ page }) => {
      await freshStart(page, "/index.html");
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(400);
      await page.screenshot({ path: OUT(file), fullPage: false });
    });
  }

  test("reflect: completed low-consistency state shows mailto + Next Action", async ({ page }) => {
    await freshStart(page, "/pages/professor-dashboard.html");

    // Set instructor email so the mailto button gets a recipient.
    await page.locator("#contact-course-select").selectOption("statistics-and-data-science-education");
    await page.locator("#contact-instructor-name").fill("Dr. J. Moon");
    await page.locator("#contact-instructor-email").fill("instructor@school.edu");
    await page.waitForTimeout(150);

    // Force a completed-but-LOW state.
    await page.evaluate(() => {
      const KEY = "code-defense-lab-workspace-state-v1";
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const state = JSON.parse(raw);
      const a = state.courses
        .flatMap((c) => c.assignments)
        .find((x) => x.id === state.activeAssignmentId);
      if (!a) return;
      a.submissionConfirmed = true;
      a.responses = a.responses || {};
      a.responses.hotspot = { q1: "x", q2: "x", q3: "x" };
      a.responses.trace = { q1: "x", q2: "x", q3: "x" };
      a.responses.mutation = { plan: "x" };
      a.responses.repair = { plan: "x" };
      localStorage.setItem(KEY, JSON.stringify(state));
    });

    await page.goto("/pages/student-result.html");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(400);
    await page.screenshot({ path: OUT("12-reflect-completed-low.png"), fullPage: false });

    // Sanity: the mailto button and Next Action card are visible.
    await expect(page.locator('#result-next-action-mount a[href^="mailto:"]')).toBeVisible();
  });
});
