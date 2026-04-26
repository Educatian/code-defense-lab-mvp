import { Suspense } from "react";
import CodeRunnerLoader from "@/components/code-runner/code-runner-loader";
import "@/components/code-runner/code-runner.css";

export const metadata = {
  title: "Sandbox · Code Defense Lab",
  description: "Smoke-test Pyodide (Python) and WebR (R) in the browser.",
};

export default function SandboxPage() {
  return (
    <main className="cdr-shell">
      <header className="cdr-shell-head">
        <a href="/" className="cdr-back">← Back to landing</a>
        <h1>Code Runner Sandbox</h1>
        <p>
          Phase 1, item 6 — verifies the in-browser execution path the student flow will use to run, trace, mutate, and repair code without sending it to a server.
        </p>
      </header>
      <Suspense fallback={<p className="cdr-loading">Loading sandbox…</p>}>
        <CodeRunnerLoader />
      </Suspense>
    </main>
  );
}
