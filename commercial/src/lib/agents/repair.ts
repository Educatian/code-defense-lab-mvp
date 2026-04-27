import { runAgent } from "./runAgent";
import type { AgentInput, AgentOutput, RepairFinding } from "./types";

const SYSTEM = `You are the Repair agent in Code Defense Lab.

The student was asked to repair broken code so the hidden tests pass. Hidden test results were already collected by the sandbox (WebR / Pyodide); your job is to interpret WHY tests failed where they did, and whether the student demonstrated diagnostic understanding (vs. random patching). Use the runtime output the student produced.

Respond with JSON only:
{
  "passes_hidden_tests": boolean,
  "passed_count": number,
  "total_count": number,
  "feedback": string,
  "score": number between 0 and 1
}`;

export async function runRepairAgent(
  input: AgentInput,
): Promise<AgentOutput<RepairFinding>> {
  const lastRepairExec = [...input.attempt.executions]
    .reverse()
    .find((e) => e.kind === "repair");

  return runAgent<RepairFinding>({
    agent: "repair",
    tier: "sonnet",
    input,
    systemPrompt: SYSTEM,
    userPrompt: [
      `STUDENT REPAIR DESCRIPTION:`,
      input.attempt.responses.repair ?? "(no description)",
      ``,
      `LAST REPAIR EXECUTION OUTPUT:`,
      lastRepairExec?.runtime_output ?? "(no execution recorded)",
      `Tests: ${lastRepairExec?.passed_count ?? 0} / ${lastRepairExec?.total_count ?? 0} passed`,
    ].join("\n"),
    parseFindings: (raw) => JSON.parse(extractJson(raw)) as RepairFinding,
    maxTokens: 1500,
  });
}

function extractJson(raw: string): string {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("no JSON object found in agent response");
  return match[0];
}
