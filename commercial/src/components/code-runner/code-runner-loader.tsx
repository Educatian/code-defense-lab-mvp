"use client";

import dynamic from "next/dynamic";

const CodeRunner = dynamic(
  () =>
    import("./code-runner").then((m) => ({
      default: m.CodeRunner,
    })),
  {
    ssr: false,
    loading: () => <p className="cdr-loading">Loading sandbox…</p>,
  },
);

export default function CodeRunnerLoader() {
  return <CodeRunner />;
}
