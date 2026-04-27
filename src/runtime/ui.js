/**
 * Drop-in UI: given a code <textarea> and a container, attach a Run button +
 * output panel that streams stdout, stderr, and rendered plots.
 *
 *   attachRunner({
 *     codeEl,                 // <textarea> with the source
 *     mountEl,                // <div> where the button + output go
 *     getLanguage: () => "r" | "python",
 *     onResult: (result) => {...},   // optional: persisted to workspace state
 *   });
 *
 * No framework — plain DOM, safe to use on every checkpoint page that has a
 * code editor. Uses textContent / createElement only (no innerHTML).
 */

import { runCode } from "./index.js";

export function attachRunner({ codeEl, mountEl, getLanguage, onResult }) {
  if (!codeEl || !mountEl) return;

  const root = document.createElement("section");
  root.className = "cdl-runner";
  root.dataset.cdlRunner = "1";
  root.setAttribute("aria-label", "Code runner");

  const toolbar = document.createElement("div");
  toolbar.className = "cdl-runner__toolbar";

  const runBtn = document.createElement("button");
  runBtn.type = "button";
  runBtn.className = "cdl-runner__run";
  runBtn.textContent = "Run";
  runBtn.setAttribute("aria-label", "Run code (shortcut: Ctrl plus Enter)");
  runBtn.setAttribute("aria-keyshortcuts", "Control+Enter");

  const status = document.createElement("span");
  status.className = "cdl-runner__status";
  status.setAttribute("aria-live", "polite");
  status.setAttribute("aria-atomic", "true");
  status.textContent = "Ready. Press Run or Ctrl + Enter.";

  const clearBtn = document.createElement("button");
  clearBtn.type = "button";
  clearBtn.className = "cdl-runner__clear";
  clearBtn.textContent = "Clear output";
  clearBtn.setAttribute("aria-label", "Clear program output and plots");

  toolbar.append(runBtn, clearBtn, status);

  const outputWrap = document.createElement("div");
  outputWrap.className = "cdl-runner__output";

  const consoleEl = document.createElement("pre");
  consoleEl.className = "cdl-runner__console";
  consoleEl.setAttribute("role", "log");
  consoleEl.setAttribute("aria-live", "polite");
  consoleEl.setAttribute("aria-label", "Program text output");

  const plotsEl = document.createElement("div");
  plotsEl.className = "cdl-runner__plots";
  plotsEl.setAttribute("aria-label", "Generated plots");

  outputWrap.append(consoleEl, plotsEl);
  root.append(toolbar, outputWrap);
  mountEl.append(root);

  function clearOutput() {
    consoleEl.textContent = "";
    while (plotsEl.firstChild) plotsEl.removeChild(plotsEl.firstChild);
  }

  function appendConsole(chunk, { kind = "stdout" } = {}) {
    if (!chunk) return;
    const span = document.createElement("span");
    span.className = `cdl-runner__line cdl-runner__line--${kind}`;
    span.textContent = chunk;
    consoleEl.appendChild(span);
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }

  function appendPlot({ mime, data, encoding, alt }) {
    const figure = document.createElement("figure");
    figure.className = "cdl-runner__plot";

    if (mime === "image/svg+xml") {
      // Inline SVG. Safe because WebR generates the SVG itself; not user prose.
      // Still, parse via DOMParser so we never assign innerHTML directly.
      const parsed = new DOMParser().parseFromString(data, "image/svg+xml");
      const root = parsed.documentElement;
      if (root && root.tagName.toLowerCase() === "svg") {
        root.setAttribute("role", "img");
        if (alt) root.setAttribute("aria-label", alt);
        figure.appendChild(root);
      }
    } else if (mime === "image/png") {
      const img = document.createElement("img");
      img.src = encoding === "base64" ? `data:image/png;base64,${data}` : data;
      img.alt = alt || "Plot";
      figure.appendChild(img);
    } else {
      const note = document.createElement("p");
      note.textContent = `Unsupported plot mime: ${mime}`;
      figure.appendChild(note);
    }
    plotsEl.appendChild(figure);
  }

  let firstRunDone = false;

  async function handleRun() {
    if (!codeEl.value.trim()) {
      status.textContent = "Add some code first, then press Run.";
      codeEl.focus();
      return;
    }
    runBtn.disabled = true;
    runBtn.textContent = "Running…";
    runBtn.setAttribute("aria-label", "Code is running, please wait.");
    status.textContent = firstRunDone
      ? "Running…"
      : "Booting runtime — first run can take 10–30 seconds. Later runs are fast.";
    clearOutput();
    const language = (getLanguage?.() || "r").toLowerCase();
    const code = codeEl.value;
    const startedAt = performance.now();
    let result;
    try {
      result = await runCode({
        language,
        code,
        onStdout: (s) => appendConsole(s, { kind: "stdout" }),
        onStderr: (s) => appendConsole(s, { kind: "stderr" }),
        onPlot: appendPlot,
      });
      const ms = Math.round(performance.now() - startedAt);
      const seconds = (ms / 1000).toFixed(ms < 1000 ? 2 : 1);
      if (result.ok) {
        status.textContent = `Done in ${seconds}s.`;
      } else {
        const trimmed = String(result.error || "").split("\n")[0].slice(0, 120);
        status.textContent = `Did not finish. ${trimmed} — see output below.`;
      }
    } catch (err) {
      const ms = Math.round(performance.now() - startedAt);
      const seconds = (ms / 1000).toFixed(ms < 1000 ? 2 : 1);
      const message = err?.message || String(err);
      appendConsole(`Runner error: ${message}\n`, { kind: "stderr" });
      status.textContent = `Did not finish in ${seconds}s. ${message.slice(0, 120)}`;
      result = { ok: false, error: message };
    } finally {
      firstRunDone = true;
      runBtn.disabled = false;
      runBtn.textContent = "Run";
      runBtn.setAttribute("aria-label", "Run code (shortcut: Ctrl plus Enter)");
      onResult?.(result);
    }
  }

  runBtn.addEventListener("click", handleRun);
  clearBtn.addEventListener("click", () => {
    clearOutput();
    status.textContent = "Output cleared. Ready.";
  });

  // Ctrl/Cmd+Enter inside the editor to run.
  codeEl.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      handleRun();
    }
  });

  return { run: handleRun, clearOutput };
}
