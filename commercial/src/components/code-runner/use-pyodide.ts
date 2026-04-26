"use client";

import { useCallback, useRef } from "react";

const PYODIDE_VERSION = "v0.29.3";
const PYODIDE_INDEX = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`;

type PyodideRuntime = {
  runPython: (code: string) => unknown;
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackage: (packages: string | string[]) => Promise<void>;
  setStdout: (opts: { batched?: (s: string) => void }) => void;
  setStderr: (opts: { batched?: (s: string) => void }) => void;
};

declare global {
  interface Window {
    loadPyodide?: (opts?: { indexURL?: string }) => Promise<PyodideRuntime>;
  }
}

export function usePyodide() {
  const runtimeRef = useRef<PyodideRuntime | null>(null);
  const pendingRef = useRef<Promise<PyodideRuntime> | null>(null);

  const initPyodide = useCallback(async (): Promise<PyodideRuntime> => {
    if (runtimeRef.current) return runtimeRef.current;
    if (pendingRef.current) return pendingRef.current;

    const pending = (async () => {
      if (!window.loadPyodide) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = `${PYODIDE_INDEX}pyodide.js`;
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load pyodide.js"));
          document.head.appendChild(script);
        });
      }
      if (!window.loadPyodide) {
        throw new Error("loadPyodide global missing after script load");
      }
      const runtime = await window.loadPyodide({ indexURL: PYODIDE_INDEX });
      runtimeRef.current = runtime;
      return runtime;
    })();

    pendingRef.current = pending;
    try {
      return await pending;
    } finally {
      pendingRef.current = null;
    }
  }, []);

  return { initPyodide };
}
