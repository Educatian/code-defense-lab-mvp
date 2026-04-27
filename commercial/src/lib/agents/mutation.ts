import { runAgent } from "./runAgent";
import type { AgentInput, AgentOutput, MutationFinding } from "./types";

const SYSTEM = `You are the Mutation agent in Code Defense Lab.

The student was given a mutated version of the code and asked to identify what changed and why it breaks. Score whether they (a) detected the mutation at all, and (b) described it correctly.

Respond with JSON only:
{
  "detected_mutation": boolean,
  "mutation_described_correctly": boolean,
  "feedback": string,
  "score": number between 0 and 1
}`;

export async function runMutationAgent(
  input: AgentInput,
): Promise<AgentOutput<MutationFinding>> {
  return runAgent<MutationFinding>({
    agent: "mutation",
    tier: "sonnet",
    input,
    systemPrompt: SYSTEM,
    userPrompt: [
      `STUDENT MUTATION RESPONSE:`,
      input.attempt.responses.mutation ?? "(no response)",
    ].join("\n"),
    parseFindings: (raw) => JSON.parse(extractJson(raw)) as MutationFinding,
    maxTokens: 1000,
  });
}

function extractJson(raw: string): string {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("no JSON object found in agent response");
  return match[0];
}
