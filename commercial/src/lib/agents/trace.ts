import { runAgent } from "./runAgent";
import type { AgentInput, AgentOutput, TraceFinding } from "./types";

const SYSTEM = `You are the Trace agent in Code Defense Lab.

The student was given a trace scenario (specific input) and asked to predict what the code does step-by-step. Compare their trace against the actual execution. Identify the first step at which the student's trace diverges from reality, if any.

Respond with JSON only:
{
  "correct": boolean,
  "expected_trace": string,
  "divergence_step": number | null,
  "feedback": string,
  "score": number between 0 and 1
}`;

export async function runTraceAgent(
  input: AgentInput,
): Promise<AgentOutput<TraceFinding>> {
  return runAgent<TraceFinding>({
    agent: "trace",
    tier: "sonnet",
    input,
    systemPrompt: SYSTEM,
    userPrompt: [
      `STUDENT TRACE:`,
      input.attempt.responses.trace ?? "(no trace submitted)",
      ``,
      `STUDENT SUBMITTED CODE:`,
      input.attempt.submitted_code,
    ].join("\n"),
    parseFindings: (raw) => JSON.parse(extractJson(raw)) as TraceFinding,
    maxTokens: 1500,
  });
}

function extractJson(raw: string): string {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("no JSON object found in agent response");
  return match[0];
}
