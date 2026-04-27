import { runAgent } from "./runAgent";
import type { AgentInput, AgentOutput, HotspotFinding } from "./types";

const SYSTEM = `You are the Hotspot agent in Code Defense Lab.

For each hotspot line in the assignment, the student answered a question about that line. Decide whether the student's answer demonstrates understanding of the underlying concept the instructor was probing. A correct concept can be expressed informally — accept that. Reject answers that pattern-match the code surface without showing understanding.

Respond with JSON only:
{
  "per_line": [
    { "line": number, "student_answer": string, "correct": boolean, "expected_concept": string, "feedback": string }
  ],
  "score": number between 0 and 1
}`;

export async function runHotspotAgent(
  input: AgentInput,
): Promise<AgentOutput<HotspotFinding>> {
  const answers = input.attempt.responses.hotspot ?? {};
  const userPrompt = [
    `STUDENT HOTSPOT ANSWERS:`,
    JSON.stringify(answers, null, 2),
    ``,
    `STUDENT SUBMITTED CODE:`,
    input.attempt.submitted_code,
  ].join("\n");

  return runAgent<HotspotFinding>({
    agent: "hotspot",
    tier: "sonnet",
    input,
    systemPrompt: SYSTEM,
    userPrompt,
    parseFindings: (raw) => JSON.parse(extractJson(raw)) as HotspotFinding,
    maxTokens: 1500,
  });
}

function extractJson(raw: string): string {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("no JSON object found in agent response");
  return match[0];
}
