/**
 * Anthropic Batch API integration for post-assessment async grading.
 *
 * Why batch:
 *   - 50% discount vs. real-time
 *   - SLA up to 24h, but typically minutes — fits the post-assessment timing constraint
 *   - Lets us submit all of an assignment's attempts in one batch and poll once when done
 *
 * Lifecycle:
 *   1. enqueueAgentBatch() builds Batch requests, one per (attempt × agent) pair.
 *   2. Anthropic returns a batch_id; we persist it on the agent_runs row.
 *   3. A scheduled job (or webhook) polls fetchBatchResults() and writes findings.
 *
 * The grading orchestration logic lives in orchestrator.ts; this file is the transport.
 */

import { getAnthropicClient } from "./client";
import { MODELS, type ModelTier } from "./models";
import type { AgentInput, AgentName } from "./types";

export interface BatchRequestSpec {
  custom_id: string;          // e.g. `${attempt_id}:${agent}`
  agent: AgentName;
  tier: ModelTier;
  systemPrompt: string;
  userPrompt: string;
  input: AgentInput;
  maxTokens?: number;
}

export async function enqueueAgentBatch(
  specs: BatchRequestSpec[],
): Promise<{ batch_id: string }> {
  if (specs.length === 0) {
    throw new Error("enqueueAgentBatch called with empty specs");
  }
  const client = getAnthropicClient();

  const batch = await client.messages.batches.create({
    requests: specs.map((spec) => ({
      custom_id: spec.custom_id,
      params: {
        model: MODELS[spec.tier],
        max_tokens: spec.maxTokens ?? 2048,
        system: [
          { type: "text", text: spec.systemPrompt, cache_control: { type: "ephemeral" } },
          {
            type: "text",
            text: renderAssignmentPrefix(spec.input),
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [{ role: "user", content: spec.userPrompt }],
      },
    })),
  });

  return { batch_id: batch.id };
}

export async function getBatchStatus(batch_id: string) {
  const client = getAnthropicClient();
  return client.messages.batches.retrieve(batch_id);
}

export async function* streamBatchResults(batch_id: string) {
  const client = getAnthropicClient();
  for await (const result of await client.messages.batches.results(batch_id)) {
    yield result;
  }
}

function renderAssignmentPrefix(input: AgentInput): string {
  const a = input.assignment;
  return [
    `LANGUAGE: ${a.language}`,
    `PROMPT:\n${a.prompt}`,
    `STARTER CODE:\n${a.starter_code}`,
    `REFERENCE CODE:\n${a.reference_code}`,
    `HIDDEN TESTS:\n${JSON.stringify(a.hidden_tests, null, 2)}`,
    `HOTSPOT FOCUS:\n${JSON.stringify(a.hotspot_focus, null, 2)}`,
    `TRACE SCENARIO:\n${a.trace_scenario}`,
    `MUTATION PROMPT:\n${a.mutation_prompt}`,
    `REPAIR PROMPT:\n${a.repair_prompt}`,
  ].join("\n\n---\n\n");
}
