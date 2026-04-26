"use client";

import { useCallback, useRef } from "react";

type WebRRuntime = {
  init: () => Promise<void>;
  evalR: (code: string) => Promise<{ toNumber: () => Promise<number> }>;
  evalRString: (code: string) => Promise<string>;
};

export function useWebR() {
  const runtimeRef = useRef<WebRRuntime | null>(null);
  const pendingRef = useRef<Promise<WebRRuntime> | null>(null);

  const initWebR = useCallback(async (): Promise<WebRRuntime> => {
    if (runtimeRef.current) return runtimeRef.current;
    if (pendingRef.current) return pendingRef.current;

    const pending = (async () => {
      const mod = await import("@r-wasm/webr");
      const webr = new mod.WebR() as unknown as WebRRuntime;
      await webr.init();
      runtimeRef.current = webr;
      return webr;
    })();

    pendingRef.current = pending;
    try {
      return await pending;
    } finally {
      pendingRef.current = null;
    }
  }, []);

  return { initWebR };
}
