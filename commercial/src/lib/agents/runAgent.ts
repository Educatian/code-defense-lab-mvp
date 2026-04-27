/**
 * Single-shot agent runner with prompt caching on the assignment-context prefix.
 *
 * The assignment context (prompt, starter, reference, hidden tests, hotspot focus, scenarios)
 * is large and identical across many students/attempts within an assignment. Marking it as
 * cache_control: ephemeral lets us pay full price once per assignment and 0.10× thereafter.
 *
 * For batch grading (post-assessment, async), prefer enqueueAgentBatch in batch.ts —
 * Anthropic's Batch API gives an additional 50% discount and fits the project's "post-assessment
 * only" agent timing constraint.
 */

import { getAnthropicClient } from "./client";
import { MODELS, estimateCostUsd, type ModelTier } from "./models";
import type { AgentInput, AgentName, AgentOutput, AgentUsage } from "./types";

interface RunAgentArgs<TFindings> {
  agent: AgentName;
  tier: ModelTier;
  input: AgentInput;
  systemPrompt: string;
  userPrompt: string; // student-specific portion only
  parseFindings: (raw: string) => TFindings;
  maxTokens?: number;
}

export async function runAgent<TFindings>(
  args: RunAgentArgs<TFindings>,
): Promise<AgentOutput<TFindings>> {
  const client = getAnthropicClient();
  const model = MODELS[args.tier];
  const startedAt = Date.now();

  // The assignment context is the cacheable prefix. Anthropic charges full input price the
  // first time this exact prefix is seen and 0.10× on subsequent cache hits within ~5 min.
  const assignmentPrefix = renderAssignmentPrefix(args.input);

  const response = await client.messages.create({
    model,
    max_tokens: args.maxTokens ?? 2048,
    system: [
      {
        type: "text",
        text: args.systemPrompt,
        cache_control: { type: "ephemeral" },
      },
      {
        type: "text",
        text: assignmentPrefix,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: args.userPrompt,
      },
    ],
  });

  const latency_ms = Date.now() - startedAt;

  const raw_text = response.content
    .filter((block) => block.type === "text")
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("\n");

  const usage: AgentUsage = {
    input_tokens: response.usage.input_tokens,
    output_tokens: response.usage.output_tokens,
    cache_creation_input_tokens: response.usage.cache_creation_input_tokens ?? 0,
    cache_read_input_tokens: response.usage.cache_read_input_tokens ?? 0,
  };

  const cost_usd = estimateCostUsd(model, usage);

  let findings: TFindings;
  try {
    findings = args.parseFindings(raw_text);
  } catch (err) {
    throw new Error(
      `Agent ${args.agent} returned text that failed parseFindings: ${(err as Error).message}\n\n` +
        `Raw response:\n${raw_text}`,
    );
  }

  return {
    agent: args.agent,
    model,
    findings,
    usage,
    cost_usd,
    latency_ms,
    raw_text,
  };
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
