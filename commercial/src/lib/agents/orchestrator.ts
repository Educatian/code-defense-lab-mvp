/**
 * Orchestrator — coordinates the post-assessment agent fleet for a single attempt.
 *
 * Two execution modes:
 *   - runAttemptInline()  → for development / single-attempt UI testing. Runs agents in
 *                           parallel where independent, awaits results synchronously.
 *   - runAttemptBatch()   → for production grading at scale. Submits to Anthropic Batch API,
 *                           returns a batch_id immediately; results are persisted by a
 *                           polling job (see app/api/batches/poll/route.ts when implemented).
 *
 * Agent dependency graph:
 *
 *   Provenance ─┐
 *   Hotspot   ──┤
 *   Trace     ──┼──► Rubric (Opus, synthesizer)
 *   Mutation  ──┤
 *   Repair    ─┘
 *
 * Provenance/Hotspot/Trace/Mutation/Repair run in parallel (independent). Rubric waits.
 */

import { runProvenanceAgent } from "./provenance";
import { runHotspotAgent } from "./hotspot";
import { runTraceAgent } from "./trace";
import { runMutationAgent } from "./mutation";
import { runRepairAgent } from "./repair";
import { runRubricAgent } from "./rubric";
import type { AgentInput, AgentOutput, RubricFinding } from "./types";

export interface AttemptGradingResult {
  rubric: AgentOutput<RubricFinding>;
  upstream: {
    provenance: AgentOutput<unknown>;
    hotspot: AgentOutput<unknown>;
    trace: AgentOutput<unknown>;
    mutation: AgentOutput<unknown>;
    repair: AgentOutput<unknown>;
  };
  total_cost_usd: number;
}

export async function runAttemptInline(input: AgentInput): Promise<AttemptGradingResult> {
  const [provenance, hotspot, trace, mutation, repair] = await Promise.all([
    runProvenanceAgent(input),
    runHotspotAgent(input),
    runTraceAgent(input),
    runMutationAgent(input),
    runRepairAgent(input),
  ]);

  const rubric = await runRubricAgent({
    ...input,
    upstream: {
      provenance: provenance.findings,
      hotspot: hotspot.findings,
      trace: trace.findings,
      mutation: mutation.findings,
      repair: repair.findings,
    },
  });

  const total_cost_usd =
    provenance.cost_usd +
    hotspot.cost_usd +
    trace.cost_usd +
    mutation.cost_usd +
    repair.cost_usd +
    rubric.cost_usd;

  return {
    rubric,
    upstream: { provenance, hotspot, trace, mutation, repair },
    total_cost_usd,
  };
}

// runAttemptBatch is left as a TODO for the batch-mode implementation. Sketch:
//
// export async function runAttemptBatch(inputs: AgentInput[]): Promise<{ batch_id: string }> {
//   const specs: BatchRequestSpec[] = inputs.flatMap((input) => [
//     buildSpec("provenance", "haiku", input),
//     buildSpec("hotspot",    "sonnet", input),
//     buildSpec("trace",      "sonnet", input),
//     buildSpec("mutation",   "sonnet", input),
//     buildSpec("repair",     "sonnet", input),
//     // Rubric runs in a SECOND batch after upstream results are in.
//   ]);
//   return enqueueAgentBatch(specs);
// }
