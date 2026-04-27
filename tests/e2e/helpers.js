// Test helpers shared by all specs.
// Resets the workspace localStorage so tests start from a known seed.

export const STORAGE_KEY = "code-defense-lab-workspace-state-v1";

/**
 * Clear the workspace state and reload to the given path. Use this at the
 * start of any test that wants the seeded defaults.
 */
export async function freshStart(page, path = "/index.html") {
  // Visit the page once so we're on the same origin (localStorage is per-origin).
  await page.goto(path);
  await page.evaluate((key) => {
    try { window.localStorage.removeItem(key); } catch { /* ignore */ }
  }, STORAGE_KEY);
  // Reload so workspace-state.js re-seeds defaults.
  await page.goto(path);
}

/**
 * Capture all console errors that happen in the page lifetime. Returns a
 * function that returns the accumulated error list. Use as:
 *   const getErrors = collectConsoleErrors(page);
 *   ... navigate / interact ...
 *   expect(getErrors()).toEqual([]);
 *
 * Filters out benign noise (Supabase optional sync warnings, favicon 404s).
 */
export function collectConsoleErrors(page) {
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (text.includes("favicon")) return;
    if (text.includes("Supabase")) return; // optional sync may warn without env
    if (text.includes("net::ERR_FAILED") && text.includes("favicon")) return;
    errors.push(text);
  });
  page.on("pageerror", (err) => {
    errors.push(`pageerror: ${err.message}`);
  });
  return () => errors.slice();
}
