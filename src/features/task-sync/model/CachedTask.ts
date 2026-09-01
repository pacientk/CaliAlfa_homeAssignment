import type { Task } from '@entities/task/model';

/**
 * A task as it lives in the local cache: the domain record plus the two pieces of local
 * bookkeeping the sync layer needs and the server never sees.
 */
export interface CachedTask extends Task {
  /**
   * True while `id` is a locally minted placeholder for a task created offline. It is a
   * stored flag rather than something derived from the id's shape, because epic §10.1
   * says ids are opaque and are never parsed.
   */
  isLocalId: boolean;
  /**
   * ISO-8601 moment of the most recent local write to this record. The input to
   * last-write-wins, and the reason a pending edit is not clobbered by a sync.
   */
  lastLocalWriteAt: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isOptionalString = (value: unknown): boolean =>
  value === undefined || typeof value === 'string';

/**
 * Validates a record restored from storage. Persisted data is untrusted input — it may
 * have been written by an earlier build with a different shape — so a record that fails
 * this is dropped rather than resurrected as a half-empty task.
 */
export const isCachedTask = (value: unknown): value is CachedTask => {
  if (!isRecord(value)) {
    return false;
  }
  if (typeof value.id !== 'string' || typeof value.title !== 'string') {
    return false;
  }
  if (typeof value.description !== 'string' || typeof value.category !== 'string') {
    return false;
  }
  if (typeof value.isDone !== 'boolean' || typeof value.createdAt !== 'string') {
    return false;
  }
  if (typeof value.isLocalId !== 'boolean' || typeof value.lastLocalWriteAt !== 'string') {
    return false;
  }
  return isOptionalString(value.expiresAt);
};

/**
 * Adopts a server record into the cache wholesale. `lastLocalWriteAt` becomes the moment
 * the server state was observed, so a later local write compares as newer and wins.
 */
export const toCachedTask = (task: Task, observedAt: string): CachedTask => ({
  ...task,
  isLocalId: false,
  lastLocalWriteAt: observedAt,
});

/**
 * Last-write-wins, the one conflict rule this app has (FR-22).
 *
 * `serverWriteAt` is the client timestamp of the write the server record embodies: for a
 * drained mutation that is the entry's own `clientTimestamp`, and for a sync it is the
 * moment the list was fetched. Comparing against it — rather than against "now" — is what
 * stops a drain response from overwriting an edit that was queued after the request left.
 *
 * String comparison is chronological because every timestamp in this app comes from
 * `Date.toISOString()`: fixed width, UTC, zero-padded.
 */
export const mergeServerRecord = (
  local: CachedTask | undefined,
  server: Task,
  serverWriteAt: string,
): CachedTask => {
  if (local === undefined) {
    return toCachedTask(server, serverWriteAt);
  }
  if (local.lastLocalWriteAt > serverWriteAt) {
    // The local copy is newer. It keeps its fields, but always adopts the server's id:
    // that is how a task created offline stops being a local id.
    return { ...local, id: server.id, isLocalId: false };
  }
  return toCachedTask(server, serverWriteAt);
};
