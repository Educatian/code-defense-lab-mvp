/**
 * Centralized Anthropic model selection and pricing for the agent fleet.
 *
 * Tiering (per project decision 2026-04-26):
 *   - Haiku  → cheap, fast classification (Provenance)
 *   - Sonnet → main reasoning (Hotspot, Trace, Mutation, Repair, Instructor-Review)
 *   - Opus   → final synthesis (Rubric, Orchestrator escalations)
 *
 * Prompt caching is REQUIRED on every agent call (assignment context is the cacheable prefix).
 * Batch API is REQUIRED for post-assessment grading (50% discount, async SLA).
 */

export const MODELS = {
  haiku: "claude-haiku-4-5",
  sonnet: "claude-sonnet-4-6",
  opus: "claude-opus-4-7",
} as const;

export type ModelTier = keyof typeof MODELS;
export type ModelId = (typeof MODELS)[ModelTier];

// Per-million-token prices in USD. Keep in sync with Anthropic pricing.
// cache_write is 1.25x base input; cache_read is 0.10x base input.
export const PRICING: Record<
  ModelId,
  { input: number; output: number; cache_write: number; cache_read: number }
> = {
  "claude-haiku-4-5":  { input: 1.0,  output: 5.0,   cache_write: 1.25,  cache_read: 0.10 },
  "claude-sonnet-4-6": { input: 3.0,  output: 15.0,  cache_write: 3.75,  cache_read: 0.30 },
  "claude-opus-4-7":   { input: 15.0, output: 75.0,  cache_write: 18.75, cache_read: 1.50 },
};

export function estimateCostUsd(
  model: ModelId,
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  },
  { batchDiscount = false }: { batchDiscount?: boolean } = {},
): number {
  const p = PRICING[model];
  const cost =
    (usage.input_tokens / 1_000_000) * p.input +
    (usage.output_tokens / 1_000_000) * p.output +
    ((usage.cache_creation_input_tokens ?? 0) / 1_000_000) * p.cache_write +
    ((usage.cache_read_input_tokens ?? 0) / 1_000_000) * p.cache_read;
  return batchDiscount ? cost * 0.5 : cost;
}
