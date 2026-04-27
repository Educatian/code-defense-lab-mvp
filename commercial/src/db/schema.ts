import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

const id = () => text("id").primaryKey();
const ts = (name: string) =>
  text(name).default(sql`CURRENT_TIMESTAMP`).notNull();

export const instructors = sqliteTable("instructors", {
  id: id(),
  email: text("email").notNull().unique(),
  display_name: text("display_name").notNull(),
  plan: text("plan", { enum: ["free", "pro"] }).notNull().default("free"),
  stripe_customer_id: text("stripe_customer_id"),
  created_at: ts("created_at"),
});

export const students = sqliteTable("students", {
  id: id(),
  instructor_id: text("instructor_id")
    .notNull()
    .references(() => instructors.id, { onDelete: "cascade" }),
  display_name: text("display_name").notNull(),
  email: text("email"),
  consent_research: integer("consent_research", { mode: "boolean" })
    .notNull()
    .default(false),
  created_at: ts("created_at"),
});

export const courses = sqliteTable("courses", {
  id: id(),
  instructor_id: text("instructor_id")
    .notNull()
    .references(() => instructors.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  title: text("title").notNull(),
  term: text("term").notNull(),
  archived_at: text("archived_at"),
  created_at: ts("created_at"),
});

export const enrollments = sqliteTable("enrollments", {
  id: id(),
  course_id: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  student_id: text("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  enrolled_at: ts("enrolled_at"),
});

export const assignments = sqliteTable("assignments", {
  id: id(),
  course_id: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  language: text("language", { enum: ["python", "r"] }).notNull(),
  title: text("title").notNull(),
  prompt: text("prompt").notNull(),
  due_at: text("due_at"),
  hotspot_focus: text("hotspot_focus", { mode: "json" })
    .$type<Array<{ line: number; question: string }>>()
    .notNull(),
  trace_scenario: text("trace_scenario").notNull(),
  mutation_prompt: text("mutation_prompt").notNull(),
  repair_prompt: text("repair_prompt").notNull(),
  starter_code: text("starter_code").notNull(),
  reference_code: text("reference_code").notNull(),
  mutation_code: text("mutation_code").notNull(),
  repair_code: text("repair_code").notNull(),
  hidden_tests: text("hidden_tests", { mode: "json" })
    .$type<Array<{ name: string; code: string }>>()
    .notNull(),
  modules: text("modules", { mode: "json" })
    .$type<{
      provenance: boolean;
      verification: boolean;
      data_reasoning: boolean;
      hotspot: boolean;
      trace: boolean;
      mutation: boolean;
      repair: boolean;
    }>()
    .notNull(),
  exemplar_responses: text("exemplar_responses", { mode: "json" })
    .$type<Record<string, string>>()
    .default(sql`'{}'`),
  published_at: text("published_at"),
  created_at: ts("created_at"),
});

export const attempts = sqliteTable("attempts", {
  id: id(),
  assignment_id: text("assignment_id")
    .notNull()
    .references(() => assignments.id, { onDelete: "cascade" }),
  student_id: text("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  status: text("status", {
    enum: ["in_progress", "submitted", "grading", "graded"],
  })
    .notNull()
    .default("in_progress"),
  current_step: text("current_step", {
    enum: ["submit", "hotspot", "trace", "mutate", "repair", "result"],
  })
    .notNull()
    .default("submit"),
  started_at: ts("started_at"),
  submitted_at: text("submitted_at"),
});

export const attempt_responses = sqliteTable("attempt_responses", {
  id: id(),
  attempt_id: text("attempt_id")
    .notNull()
    .references(() => attempts.id, { onDelete: "cascade" }),
  group: text("group", {
    enum: [
      "provenance",
      "verification",
      "data_reasoning",
      "hotspot",
      "trace",
      "mutation",
      "repair",
    ],
  }).notNull(),
  field: text("field").notNull(),
  value: text("value").notNull(),
  updated_at: ts("updated_at"),
});

export const attempt_executions = sqliteTable("attempt_executions", {
  id: id(),
  attempt_id: text("attempt_id")
    .notNull()
    .references(() => attempts.id, { onDelete: "cascade" }),
  kind: text("kind", { enum: ["trace", "mutation", "repair", "submit"] }).notNull(),
  student_input: text("student_input").notNull(),
  runtime_output: text("runtime_output").notNull(),
  passed_count: integer("passed_count").notNull().default(0),
  total_count: integer("total_count").notNull().default(0),
  executed_at: ts("executed_at"),
});

export const agent_runs = sqliteTable("agent_runs", {
  id: id(),
  attempt_id: text("attempt_id")
    .notNull()
    .references(() => attempts.id, { onDelete: "cascade" }),
  agent: text("agent", {
    enum: ["provenance", "hotspot", "trace", "mutation", "repair", "rubric"],
  }).notNull(),
  model: text("model").notNull(),
  input_tokens: integer("input_tokens").notNull().default(0),
  output_tokens: integer("output_tokens").notNull().default(0),
  cost_usd: real("cost_usd").notNull().default(0),
  latency_ms: integer("latency_ms").notNull().default(0),
  status: text("status", { enum: ["queued", "running", "ok", "error"] })
    .notNull()
    .default("queued"),
  created_at: ts("created_at"),
  completed_at: text("completed_at"),
});

export const agent_findings = sqliteTable("agent_findings", {
  id: id(),
  agent_run_id: text("agent_run_id")
    .notNull()
    .references(() => agent_runs.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  payload: text("payload", { mode: "json" }).$type<unknown>().notNull(),
});

export const results = sqliteTable("results", {
  attempt_id: text("attempt_id")
    .primaryKey()
    .references(() => attempts.id, { onDelete: "cascade" }),
  correctness: real("correctness").notNull(),
  hotspot: real("hotspot").notNull(),
  trace: real("trace").notNull(),
  mutation: real("mutation").notNull(),
  repair: real("repair").notNull(),
  consistency: real("consistency").notNull(),
  level: text("level", { enum: ["HIGH", "MEDIUM", "LOW"] }).notNull(),
  rubric_narrative: text("rubric_narrative").notNull(),
  next_step: text("next_step").notNull(),
  produced_by_agent_run_id: text("produced_by_agent_run_id"),
  finalized_at: ts("finalized_at"),
});

export const review_records = sqliteTable("review_records", {
  attempt_id: text("attempt_id")
    .primaryKey()
    .references(() => attempts.id, { onDelete: "cascade" }),
  viva_notes: text("viva_notes", { mode: "json" })
    .$type<Array<{ at: string; note: string }>>()
    .default(sql`'[]'`),
  instructor_summary: text("instructor_summary"),
  status: text("status", {
    enum: ["unreviewed", "noted", "viva_recommended", "closed"],
  })
    .notNull()
    .default("unreviewed"),
  updated_at: ts("updated_at"),
});

export const audit_log = sqliteTable("audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  actor_id: text("actor_id").notNull(),
  actor_kind: text("actor_kind", { enum: ["instructor", "student", "system"] })
    .notNull(),
  action: text("action").notNull(),
  target_table: text("target_table").notNull(),
  target_id: text("target_id").notNull(),
  payload: text("payload", { mode: "json" }).$type<unknown>(),
  at: ts("at"),
});

export type Instructor = typeof instructors.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Assignment = typeof assignments.$inferSelect;
export type Attempt = typeof attempts.$inferSelect;
export type Result = typeof results.$inferSelect;
