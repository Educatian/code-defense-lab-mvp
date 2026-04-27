// Sync spec: same-browser localStorage propagation between student-side
// edits and professor-side review.

import { test, expect } from "@playwright/test";
import { freshStart } from "./helpers.js";

test.describe("Student → Professor sync", () => {
  test("Hotspot/Trace/Mutation/Repair answers a student types appear in the professor detail view", async ({ page }) => {
    await freshStart(page, "/index.html");

    // 1. Student fills a hotspot answer.
    await page.goto("/pages/hotspot-questions.html");
    await page.locator("#hotspot-answer-1").fill("PLAYWRIGHT-HOTSPOT-Q1: lm() defines outcome ~ predictor.");
    await page.waitForTimeout(150); // input handler debounce settles

    // 2. Student fills a trace prediction.
    await page.goto("/pages/trace-mode-task.html");
    await page.locator("#trace-answer-1").fill("PLAYWRIGHT-TRACE-Q1: 5.5");
    await page.waitForTimeout(150);

    // 3. Student fills a mutation plan.
    await page.goto("/pages/mutation-task.html");
    await page.locator("#mutation-answer").fill("PLAYWRIGHT-MUTATION: Add df <- na.omit(df) before lm().");
    await page.waitForTimeout(150);

    // 4. Student fills a repair note.
    await page.goto("/pages/repair-mode-task.html");
    await page.locator("#repair-answer").fill("PLAYWRIGHT-REPAIR: Swap formula back to exam_score ~ hours_studied.");
    await page.waitForTimeout(150);

    // 5. Switch to the professor-student-detail page (same browser, same
    //    localStorage). The professor should see the same answers because the
    //    workspace state was persisted by every input.
    await page.goto("/pages/professor-student-detail.html");

    // Look for the unique sentinel strings somewhere in the rendered body.
    const body = page.locator("body");
    await expect(body).toContainText("PLAYWRIGHT-HOTSPOT-Q1");
    await expect(body).toContainText("PLAYWRIGHT-TRACE-Q1");
    await expect(body).toContainText("PLAYWRIGHT-MUTATION");
    await expect(body).toContainText("PLAYWRIGHT-REPAIR");
  });

  test("Student answers also surface in the student Result page (Response Snapshot)", async ({ page }) => {
    await freshStart(page, "/index.html");
    await page.goto("/pages/hotspot-questions.html");
    await page.locator("#hotspot-answer-1").fill("RESULT-SNAPSHOT-CHECK");
    await page.waitForTimeout(150);
    await page.goto("/pages/student-result.html");
    await expect(page.locator("body")).toContainText("RESULT-SNAPSHOT-CHECK");
  });
});

test.describe("Professor → Student sync", () => {
  test("Instructor email set on dashboard appears in the Result page mailto link", async ({ page }) => {
    await freshStart(page, "/pages/professor-dashboard.html");

    const select = page.locator("#contact-course-select");
    const emailInput = page.locator("#contact-instructor-email");
    const nameInput = page.locator("#contact-instructor-name");

    // Use the seeded active course id (the default state activates the
    // Statistics & DS course where the default assignment lives). This is
    // stable across runs and doesn't depend on a localStorage write having
    // happened yet.
    const ACTIVE_COURSE_ID = "statistics-and-data-science-education";
    await select.selectOption(ACTIVE_COURSE_ID);

    await nameInput.fill("Dr. Sync");
    await emailInput.fill("sync@school.edu");
    await page.waitForTimeout(200);

    // Mark all checkpoints complete via state mutation so the Result page
    // shows the LOW-level Suggested-next-step branch (which renders the
    // mailto button). Easier than walking each checkpoint here.
    await page.evaluate(() => {
      const KEY = "code-defense-lab-workspace-state-v1";
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const state = JSON.parse(raw);
      const a = state.courses
        .flatMap((c) => c.assignments.map((x) => ({ x, c })))
        .find((p) => p.x.id === state.activeAssignmentId);
      if (!a) return;
      a.x.submissionConfirmed = true;
      a.x.responses = a.x.responses || {};
      a.x.responses.hotspot = { q1: "x", q2: "x", q3: "x" };
      a.x.responses.trace = { q1: "x", q2: "x", q3: "x" };
      a.x.responses.mutation = { plan: "x" };
      a.x.responses.repair = { plan: "x" };
      localStorage.setItem(KEY, JSON.stringify(state));
    });

    await page.goto("/pages/student-result.html");

    const mailto = page.locator('#result-next-action-mount a[href^="mailto:"]');
    await expect(mailto).toBeVisible();
    const href = await mailto.getAttribute("href");
    expect(href).toContain("mailto:sync%40school.edu");
    expect(href).toContain("subject=");
    expect(href).toContain("Oral%20defense%20request");
  });
});
