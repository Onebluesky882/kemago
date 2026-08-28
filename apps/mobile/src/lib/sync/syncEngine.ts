import { getPendingSyncCount } from "../db/postsRepo";

export type SyncResult = {
  pending: number;
};

// No Go backend endpoint exists yet for stage-7-feed (POST /v1/feed per
// CONTRACTS.md), so this only reports how many local writes are queued
// in sync_outbox for now — call it from wherever the app wants to show
// "N changes not yet synced" (e.g. a Profile settings row).
//
// Once the endpoint exists: read each pending sync_outbox row, POST its
// payload via apiFetch() with the Bearer token, then delete the row on
// success (leave it queued and retry with backoff on failure).
export async function runBackgroundSync(): Promise<SyncResult> {
  const pending = await getPendingSyncCount();
  return { pending };
}
