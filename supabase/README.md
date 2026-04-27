# Supabase schemas & migrations

This project follows a **two-DB separation** model (per project decision 2026-04-26):

| DB                   | Purpose                                                            | Contains PII? |
| -------------------- | ------------------------------------------------------------------ | ------------- |
| **Commercial** (`commercial.*`) | Instructor accounts, courses, students, submissions, agent runs     | YES — FERPA-audited |
| **Research** (`research.*`)     | Opt-in anonymized learning trajectories for ADDIE Lab studies (IRB) | NO — anonymized only |

These **must** live in two separate Supabase projects in production. The migration files in `migrations/research/` are the source of truth for the research project; everything else is for the commercial project.

## Migration ordering

```
supabase/
├── workspace_states.sql              # LEGACY — original demo workspace blob (deployed)
├── migrations/
│   ├── 0001_workspace_states.sql                # Snapshot of deployed legacy table (DO NOT re-run on prod)
│   ├── 0002_workspace_states_per_owner_rls.sql  # NEEDS APPROVAL — locks down RLS to per-owner
│   ├── 0003_commercial_schema.sql               # NEEDS APPROVAL — instructor/student/course/submission tables
│   └── research/
│       └── 0001_research_schema.sql             # NEEDS APPROVAL — separate Supabase project; anonymized only
```

## ⚠️  Approval required

Per project rule (`feedback_reviewlens_no_destructive_db.md` precedent applies here too): **no destructive DDL** (DROP TABLE, TRUNCATE, destructive ALTER) without explicit user approval. Every migration in this directory is **additive only**. Migration files marked `NEEDS APPROVAL` are not yet applied to any environment — the user must review and run them manually.

## How to apply (when approved)

```bash
# Commercial project
supabase db push --project-ref <commercial-project-ref> \
  --include supabase/migrations/0002_workspace_states_per_owner_rls.sql \
  --include supabase/migrations/0003_commercial_schema.sql

# Research project (separate)
supabase db push --project-ref <research-project-ref> \
  --include supabase/migrations/research/0001_research_schema.sql
```
