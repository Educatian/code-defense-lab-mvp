/**
 * Public entry point for the in-browser code runtime.
 *
 *   import { runCode } from "/src/runtime/index.js";
 *   const result = await runCode({
 *     language: "r" | "python",
 *     code: "<source>",
 *     onStdout: (chunk) => {...},
 *     onStderr: (chunk) => {...},
 *     onPlot:   ({ mime, data, alt }) => {...},
 *     timeoutMs: 30000,
 *   });
 *
 * The adapters are lazy-loaded on first use so the page stays fast until the
 * student clicks Run. Both adapters cache their initialized worker, so the
 * second Run is fast.
 *
 * Why CDN imports: the project is a static Vite build that deploys to GitHub
 * Pages, which does not (and cannot easily) serve the COOP/COEP headers that
 * WebR's SharedArrayBuffer transport requires. The PostMessage channel works
 * everywhere; we use it explicitly. Pyodide doesn't need SAB at all.
 */

export async function runCode({
  language,
  code,
  onStdout,
  onStderr,
  onPlot,
  timeoutMs = 30000,
}) {
  if (!code || !code.trim()) {
    throw new Error("No code to run.");
  }

  const adapter = await loadAdapter(language);
  const result = await withTimeout(
    adapter.run({ code, onStdout, onStderr, onPlot }),
    timeoutMs,
    `${language} execution exceeded ${timeoutMs}ms`,
  );
  return result;
}

let cachedRAdapter = null;
let cachedPyAdapter = null;

async function loadAdapter(language) {
  if (language === "r") {
    if (!cachedRAdapter) {
      const mod = await import("./webrAdapter.js");
      cachedRAdapter = await mod.createWebRAdapter();
    }
    return cachedRAdapter;
  }
  if (language === "python") {
    if (!cachedPyAdapter) {
      const mod = await import("./pyodideAdapter.js");
      cachedPyAdapter = await mod.createPyodideAdapter();
    }
    return cachedPyAdapter;
  }
  throw new Error(`Unsupported language: ${language}`);
}

function withTimeout(promise, ms, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export { attachRunner } from "./ui.js";
