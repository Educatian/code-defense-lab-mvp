/**
 * Shared types for the agent fleet.
 *
 * Each agent receives an AgentInput (the full attempt context) and returns an AgentOutput
 * with a structured findings payload + token usage so we can persist to agent_runs +
 * agent_findings. Findings shape is intentionally agent-specific (use a discriminated union).
 */

import type { ModelId } from "./models";

export type AgentName =
  | "provenance"
  | "hotspot"
  | "trace"
  | "mutation"
  | "repair"
  | "rubric"
  | "orchestrator"
  | "instructor_review";

export interface AssignmentContext {
  language: "python" | "r";
  prompt: string;
  starter_code: string;
  reference_code: string;
  hidden_tests: Array<{ name: string; code: string }>;
  hotspot_focus: Array<{ line: number; question: string }>;
  trace_scenario: string;
  mutation_prompt: string;
  repair_prompt: string;
}

export interface StudentAttempt {
  attempt_id: string;
  submitted_code: string;
  responses: {
    provenance?: string;
    hotspot?: Record<string, string>;   // line → free-text answer
    trace?: string;
    mutation?: string;
    repair?: string;
  };
  executions: Array<{
    kind: "trace" | "mutation" | "repair" | "submit";
    runtime_output: string;
    passed_count: number;
    total_count: number;
  }>;
}

export interface AgentInput {
  assignment: AssignmentContext;
  attempt: StudentAttempt;
}

export interface AgentUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
}

export interface AgentOutput<TFindings = unknown> {
  agent: AgentName;
  model: ModelId;
  findings: TFindings;
  usage: AgentUsage;
  cost_usd: number;
  latency_ms: number;
  raw_text?: string;
}

// Per-agent finding shapes ------------------------------------------------

export interface ProvenanceFinding {
  classification: "self_written" | "ai_assisted" | "external_examples" | "uncertain";
  confidence: number; // 0..1
  signals: string[];
}

export interface HotspotFinding {
  per_line: Array<{
    line: number;
    student_answer: string;
    correct: boolean;
    expected_concept: string;
    feedback: string;
  }>;
  score: number; // 0..1
}

export interface TraceFinding {
  correct: boolean;
  expected_trace: string;
  divergence_step?: number;
  feedback: string;
  score: number; // 0..1
}

export interface MutationFinding {
  detected_mutation: boolean;
  mutation_described_correctly: boolean;
  feedback: string;
  score: number; // 0..1
}

export interface RepairFinding {
  passes_hidden_tests: boolean;
  passed_count: number;
  total_count: number;
  feedback: string;
  score: number; // 0..1
}

export interface RubricFinding {
  correctness: number;
  hotspot: number;
  trace: number;
  mutation: number;
  repair: number;
  consistency: number;
  level: "HIGH" | "MEDIUM" | "LOW";
  rubric_narrative: string;
  next_step: string;
}
