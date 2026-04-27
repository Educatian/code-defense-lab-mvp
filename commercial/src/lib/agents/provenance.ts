import { runAgent } from "./runAgent";
import type { AgentInput, AgentOutput, ProvenanceFinding } from "./types";

const SYSTEM = `You are the Provenance agent in Code Defense Lab.

Decide whether the student's submitted code looks self-written, AI-assisted, or copied from external examples. Use stylistic and structural signals (variable naming consistency, comment density, idiomatic patterns vs. textbook patterns, alignment between the student's stated provenance and the code's surface features). Do NOT moralize or accuse — your job is to surface signals, not to convict.

Respond with JSON only, matching this schema:
{
  "classification": "self_written" | "ai_assisted" | "external_examples" | "uncertain",
  "confidence": number between 0 and 1,
  "signals": string[]
}`;

export async function runProvenanceAgent(
  input: AgentInput,
): Promise<AgentOutput<ProvenanceFinding>> {
  return runAgent<ProvenanceFinding>({
    agent: "provenance",
    tier: "haiku",
    input,
    systemPrompt: SYSTEM,
    userPrompt: [
      `STUDENT-DECLARED PROVENANCE: ${input.attempt.responses.provenance ?? "(not declared)"}`,
      ``,
      `STUDENT SUBMITTED CODE:`,
      input.attempt.submitted_code,
    ].join("\n"),
    parseFindings: (raw) => JSON.parse(extractJson(raw)) as ProvenanceFinding,
    maxTokens: 512,
  });
}

function extractJson(raw: string): string {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("no JSON object found in agent response");
  return match[0];
}
