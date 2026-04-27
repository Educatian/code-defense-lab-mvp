/**
 * Anthropic SDK client factory. Server-side only — never import from client components.
 *
 * Key safety:
 *   - Reads ANTHROPIC_API_KEY from env. Never expose this to the browser.
 *   - All fetches go through the Next.js server runtime; the browser never sees the key.
 *   - Direct browser → api.anthropic.com calls are forbidden (would leak the key in DevTools).
 */

import Anthropic from "@anthropic-ai/sdk";

let cached: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  // Hard guardrail: refuse to construct a client in the browser bundle.
  if (typeof window !== "undefined") {
    throw new Error(
      "getAnthropicClient() called from the browser. Move this call to a server action, " +
        "route handler, or Edge Function. The Anthropic API key must never be shipped to the client.",
    );
  }
  if (cached) return cached;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local (dev) or your Vercel/host secrets (prod).",
    );
  }
  cached = new Anthropic({ apiKey });
  return cached;
}
