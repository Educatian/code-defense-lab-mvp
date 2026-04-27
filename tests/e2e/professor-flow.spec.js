// Professor flow: dashboard loads, course creation works (with instructor
// fields), instructor contact section auto-saves, persists across reload.

import { test, expect } from "@playwright/test";
import { freshStart, collectConsoleErrors } from "./helpers.js";

test.describe("Professor flow", () => {
  test.beforeEach(async ({ page }) => {
    await freshStart(page, "/pages/professor-dashboard.html");
  });

  test("Dashboard loads with seeded courses + Instructor Contacts section", async ({ page }) => {
    const getErrors = collectConsoleErrors(page);

    // Seeded sections.
    await expect(page.getByRole("heading", { name: "Update contact info per course" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Create a new course" })).toBeVisible();

    // Contacts course select is populated with the seeded courses (3).
    const contactSelect = page.locator("#contact-course-select");
    await expect(contactSelect).toBeVisible();
    const options = await contactSelect.locator("option").allTextContents();
    expect(options.length).toBeGreaterThanOrEqual(3);

    // Quick-Register inputs are present.
    await expect(page.locator("#course-instructor-name-input")).toBeVisible();
    await expect(page.locator("#course-instructor-email-input")).toBeVisible();

    expect(getErrors()).toEqual([]);
  });

  test("Setting instructor email via the Contacts form persists across reload", async ({ page }) => {
    const select = page.locator("#contact-course-select");
    const nameInput = page.locator("#contact-instructor-name");
    const emailInput = page.locator("#contact-instructor-email");

    // Pick the first seeded course.
    const firstValue = await select.locator("option").first().getAttribute("value");
    await select.selectOption(firstValue);

    await nameInput.fill("Dr. Test Instructor");
    await emailInput.fill("test.instructor@school.edu");
    // input handler triggers persist immediately.
    await page.waitForTimeout(100); // tiny settle for the input handler

    await page.reload();
    await select.selectOption(firstValue);
    await expect(nameInput).toHaveValue("Dr. Test Instructor");
    await expect(emailInput).toHaveValue("test.instructor@school.edu");

    // Feedback line confirms saved state.
    await expect(page.locator("#contact-feedback")).toContainText("test.instructor@school.edu");
  });

  test("Quick-Register creates a new course with instructor info", async ({ page }) => {
    const titleInput = page.locator("#course-title-input");
    const termInput = page.locator("#course-term-input");
    const countInput = page.locator("#course-count-input");
    const nameInput = page.locator("#course-instructor-name-input");
    const emailInput = page.locator("#course-instructor-email-input");
    const button = page.locator("#register-course-btn");
    const feedback = page.locator("#course-register-feedback");

    await titleInput.fill("Playwright Test Course");
    await termInput.fill("Test Term");
    await countInput.fill("12");
    await nameInput.fill("Dr. PW");
    await emailInput.fill("pw@school.edu");

    await button.click();

    await expect(feedback).toContainText("Playwright Test Course");

    // The new course should appear in the assignment-course dropdown
    // (proves it's in workspace state).
    const assignmentSelect = page.locator("#assignment-course-select");
    const options = await assignmentSelect.locator("option").allTextContents();
    expect(options.some((o) => o.includes("Playwright Test Course"))).toBeTruthy();

    // And in the contacts dropdown.
    const contactsSelect = page.locator("#contact-course-select");
    const cOptions = await contactsSelect.locator("option").allTextContents();
    expect(cOptions.some((o) => o.includes("Playwright Test Course"))).toBeTruthy();

    // Reload and confirm the new course is still there (state persisted).
    await page.reload();
    const optionsAfter = await page.locator("#assignment-course-select option").allTextContents();
    expect(optionsAfter.some((o) => o.includes("Playwright Test Course"))).toBeTruthy();
  });
});
