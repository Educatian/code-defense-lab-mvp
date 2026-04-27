// ⚠️  MULTI-TENANT WARNING — DEMO USE ONLY
// ─────────────────────────────────────────
// This module syncs the entire workspace state to a SINGLE shared row in
// Supabase, keyed by VITE_SUPABASE_WORKSPACE_ID. Every visitor of the deployed
// demo writes to the same row, so each save stomps the previous one. There is
// no auth, no per-instructor partitioning, and no RLS that would prevent it.
//
// This is intentional for the public read-only demo (last write wins, no real
// student data is at risk). It is NOT safe for any production / pilot use.
//
// To make this safe:
//   1. Apply supabase/migrations/0002_workspace_states_per_owner_rls.sql
//      (locks RLS to per-owner rows under auth.uid())
//   2. Apply supabase/migrations/0003_commercial_schema.sql
//      (real multi-tenant tables: instructors, students, courses, attempts, …)
//   3. Add a Supabase Auth flow (magic link or OAuth) before swapping
//      workspaceId for an auth-derived per-instructor id.
//
// Until step 3 lands, do NOT point this MVP at a Supabase project that holds
// any non-synthetic data.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const workspaceTable = import.meta.env.VITE_SUPABASE_WORKSPACE_TABLE || "workspace_states";
const workspaceId = import.meta.env.VITE_SUPABASE_WORKSPACE_ID || "code-defense-lab-mvp";

let clientInstance = null;
let syncInitialized = false;
let saveTimer = null;

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) return null;
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return clientInstance;
}

export function isSupabaseWorkspaceConfigured() {
  return Boolean(getSupabaseClient());
}

async function fetchRemoteWorkspaceRow() {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from(workspaceTable)
    .select("id, payload, updated_at")
    .eq("id", workspaceId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function upsertRemoteWorkspaceRow(state) {
  const client = getSupabaseClient();
  if (!client) return;

  const payload = JSON.parse(JSON.stringify(state));
  const { error } = await client.from(workspaceTable).upsert(
    {
      id: workspaceId,
      payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) throw error;
}

export async function initializeSupabaseWorkspaceSync(options) {
  const { getLocalState, applyRemoteState } = options;
  if (syncInitialized || !isSupabaseWorkspaceConfigured()) return;
  syncInitialized = true;

  try {
    const remoteRow = await fetchRemoteWorkspaceRow();
    if (!remoteRow?.payload) return;

    const localState = getLocalState();
    const localUpdatedAt = new Date(localState?.updatedAt || 0).getTime();
    const remoteUpdatedAt = new Date(remoteRow.payload?.updatedAt || remoteRow.updated_at || 0).getTime();

    if (!localUpdatedAt || remoteUpdatedAt > localUpdatedAt) {
      applyRemoteState(remoteRow.payload);
    }
  } catch (error) {
    console.warn("Supabase workspace sync skipped:", error.message || error);
  }
}

export function queueSupabaseWorkspaceSave(state) {
  if (!isSupabaseWorkspaceConfigured()) return;

  if (saveTimer) window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(async () => {
    try {
      await upsertRemoteWorkspaceRow(state);
    } catch (error) {
      console.warn("Supabase workspace save failed:", error.message || error);
    }
  }, 500);
}
