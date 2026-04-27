/**
 * Pyodide adapter — Python in-browser via WebAssembly. (STUBBED)
 *
 * Currently disabled because the runtime would need to load Pyodide from a
 * third-party CDN. The architecture is in place; flip on by replacing this
 * file with the working adapter once self-hosting is decided.
 *
 * To enable later, this adapter must:
 *   1. Load pyodide.mjs (self-hosted in /public/pyodide/ to avoid CDN policy)
 *   2. Preload numpy + matplotlib + scipy + pandas
 *   3. Redirect sys.stdout/stderr to onStdout/onStderr callbacks
 *   4. Patch matplotlib.pyplot.show() to forward PNG bytes to onPlot
 *
 * Until then, the runtime cleanly errors instead of silently doing nothing.
 */

export async function createPyodideAdapter() {
  return {
    language: "python",
    async run({ onStderr }) {
      const message =
        "Python execution is not enabled in this build.\n" +
        "Self-hosted Pyodide can be added at /public/pyodide/ — see " +
        "src/runtime/pyodideAdapter.js for the implementation contract.";
      onStderr?.(message + "\n");
      return { ok: false, error: message };
    },
  };
}
