/**
 * Instructor-Review agent — assists the human instructor during review, not during grading.
 *
 * This is a different beast from the grading agents:
 *   - It runs AFTER an instructor opens an attempt for review
 *   - It surfaces "things to look at" rather than scoring
 *   - It can suggest viva (oral defense) prompts based on weak checkpoints
 *
 * Output is intentionally brief and discussion-friendly.
 */

import { runAgent } from "./runAgent";
import type { AgentInput, AgentOutput, RubricFinding } from "./types";

const SYSTEM = `You are the Instructor-Review agent in Code Defense Lab.

A human instructor is opening this student's attempt for review. Surface 2–4 specific things worth looking at, plus 1–2 viva-style oral questions the instructor could ask if they want to verify understanding live. Be terse, concrete, and grounded in the upstream findings — do not invent claims.

Respond with JSON only:
{
  "things_to_look_at": string[],
  "viva_prompts": string[]
}`;

export interface InstructorReviewFinding {
  things_to_look_at: string[];
  viva_prompts: string[];
}

export async function runInstructorReviewAgent(
  input: AgentInput & { rubric: RubricFinding },
): Promise<AgentOutput<InstructorReviewFinding>> {
  return runAgent<InstructorReviewFinding>({
    agent: "instructor_review",
    tier: "sonnet",
    input,
    systemPrompt: SYSTEM,
    userPrompt: [
      `RUBRIC:`,
      JSON.stringify(input.rubric, null, 2),
      ``,
      `STUDENT SUBMITTED CODE:`,
      input.attempt.submitted_code,
    ].join("\n"),
    parseFindings: (raw) => JSON.parse(extractJson(raw)) as InstructorReviewFinding,
    maxTokens: 800,
  });
}

function extractJson(raw: string): string {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("no JSON object found in agent response");
  return match[0];
}
