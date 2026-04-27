import { runAgent } from "./runAgent";
import type {
  AgentInput,
  AgentOutput,
  HotspotFinding,
  MutationFinding,
  ProvenanceFinding,
  RepairFinding,
  RubricFinding,
  TraceFinding,
} from "./types";

const SYSTEM = `You are the Rubric agent in Code Defense Lab — the final synthesis step.

You will receive structured findings from the upstream agents (Provenance, Hotspot, Trace, Mutation, Repair). Synthesize a final rubric judgment. Internal consistency matters: a student whose code passes 100% of tests but who couldn't trace, repair, or describe the mutation should NOT receive a HIGH level — that's the AI-era assessment signal we care most about.

Levels:
  HIGH   — strong correctness AND strong understanding signals
  MEDIUM — partial; one or two checkpoints weak
  LOW    — many checkpoints weak OR strong correctness with very weak understanding (this is the "AI-defended" pattern)

Respond with JSON only:
{
  "correctness": number 0..1,
  "hotspot": number 0..1,
  "trace": number 0..1,
  "mutation": number 0..1,
  "repair": number 0..1,
  "consistency": number 0..1,
  "level": "HIGH" | "MEDIUM" | "LOW",
  "rubric_narrative": string,
  "next_step": string
}`;

export interface RubricInput extends AgentInput {
  upstream: {
    provenance: ProvenanceFinding;
    hotspot: HotspotFinding;
    trace: TraceFinding;
    mutation: MutationFinding;
    repair: RepairFinding;
  };
}

export async function runRubricAgent(
  input: RubricInput,
): Promise<AgentOutput<RubricFinding>> {
  return runAgent<RubricFinding>({
    agent: "rubric",
    tier: "opus",
    input,
    systemPrompt: SYSTEM,
    userPrompt: [
      `UPSTREAM AGENT FINDINGS:`,
      JSON.stringify(input.upstream, null, 2),
      ``,
      `STUDENT-DECLARED PROVENANCE:`,
      input.attempt.responses.provenance ?? "(not declared)",
    ].join("\n"),
    parseFindings: (raw) => JSON.parse(extractJson(raw)) as RubricFinding,
    maxTokens: 2000,
  });
}

function extractJson(raw: string): string {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("no JSON object found in agent response");
  return match[0];
}
