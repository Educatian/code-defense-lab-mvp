"use client";

import { useState } from "react";
import { usePyodide } from "./use-pyodide";
import { useWebR } from "./use-webr";

type Status = "idle" | "loading" | "ready" | "error";

const PY_HELLO = `
import sys
print("Hello from Pyodide ·", sys.version.split()[0])
result = sum(range(1, 11))
print(f"Sum 1..10 = {result}")
`.trim();

const R_HELLO = 'paste(c("Hello from WebR ·", R.version.string), collapse=" ")';

export function CodeRunner() {
  const { initPyodide } = usePyodide();
  const { initWebR } = useWebR();

  const [pyStatus, setPyStatus] = useState<Status>("idle");
  const [rStatus, setRStatus] = useState<Status>("idle");
  const [pyOutput, setPyOutput] = useState<string>("");
  const [rOutput, setROutput] = useState<string>("");

  async function runPython() {
    setPyStatus("loading");
    setPyOutput("");
    const lines: string[] = [];
    try {
      const py = await initPyodide();
      py.setStdout({ batched: (s: string) => lines.push(s) });
      py.setStderr({ batched: (s: string) => lines.push(s) });
      await py.runPythonAsync(PY_HELLO);
      setPyOutput(lines.join("\n"));
      setPyStatus("ready");
    } catch (err) {
      setPyOutput(err instanceof Error ? err.message : String(err));
      setPyStatus("error");
    }
  }

  async function runR() {
    setRStatus("loading");
    setROutput("");
    try {
      const webr = await initWebR();
      const result = await webr.evalRString(R_HELLO);
      setROutput(result);
      setRStatus("ready");
    } catch (err) {
      setROutput(err instanceof Error ? err.message : String(err));
      setRStatus("error");
    }
  }

  return (
    <section className="cdr-runner">
      <header className="cdr-header">
        <span className="cdr-eyebrow">SANDBOX</span>
        <h2 className="cdr-title">Run Python and R in the browser</h2>
        <p className="cdr-lede">
          Pyodide and WebR load the first time you click Run (10–30s). After that, execution is instant. Code never leaves your device.
        </p>
      </header>

      <div className="cdr-grid">
        <article className="cdr-cell">
          <div className="cdr-cell-head">
            <span className="cdr-lang">Python · Pyodide</span>
            <StatusPill status={pyStatus} />
          </div>
          <pre className="cdr-code">{PY_HELLO}</pre>
          <button
            className="cdr-run"
            onClick={runPython}
            disabled={pyStatus === "loading"}
            type="button"
          >
            {pyStatus === "loading" ? "Loading runtime…" : "Run Python"}
          </button>
          <pre className="cdr-output" data-status={pyStatus}>
            {pyOutput || "(no output yet)"}
          </pre>
        </article>

        <article className="cdr-cell">
          <div className="cdr-cell-head">
            <span className="cdr-lang">R · WebR</span>
            <StatusPill status={rStatus} />
          </div>
          <pre className="cdr-code">{R_HELLO}</pre>
          <button
            className="cdr-run"
            onClick={runR}
            disabled={rStatus === "loading"}
            type="button"
          >
            {rStatus === "loading" ? "Loading runtime…" : "Run R"}
          </button>
          <pre className="cdr-output" data-status={rStatus}>
            {rOutput || "(no output yet)"}
          </pre>
        </article>
      </div>
    </section>
  );
}

function StatusPill({ status }: { status: Status }) {
  const label =
    status === "idle"
      ? "idle"
      : status === "loading"
        ? "loading"
        : status === "ready"
          ? "ready"
          : "error";
  return <span className="cdr-pill" data-status={status}>{label}</span>;
}
