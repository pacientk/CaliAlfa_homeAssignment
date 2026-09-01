import type { ApiFailure } from '@shared/api';
import { create } from 'zustand';

/**
 * Why the *kind* rather than a message: the failure the queue gives up on is an
 * `ApiFailure`, and the banner has to choose different wording for "no connection" and
 * "the server rejected that change". Flattening it to a message here would either put
 * user-facing copy in the store — which belongs in `shared/lib/strings.ts` — or throw
 * away the only thing the banner needs to pick one.
 */
export type SyncErrorKind = ApiFailure['kind'];

/**
 * What the offline banner renders. Deliberately three scalars: task data lives in the
 * query cache and is never mirrored here (epic §11.2).
 */
export interface SyncState {
  isOnline: boolean;
  pendingCount: number;
  /** The last failure the queue gave up on. Absent once nothing has failed. */
  lastError?: SyncErrorKind;
}

interface SyncStore extends SyncState {
  /** Replaces the whole state. The sync bindings are the only writer. */
  setSyncState(next: SyncState): void;
}

/**
 * Optimistic defaults, matching the connectivity service: with no evidence either way,
 * the app assumes it is online and shows no banner rather than flashing one on start.
 */
export const SYNC_STORE_INITIAL_STATE: SyncState = { isOnline: true, pendingCount: 0 };

/**
 * The store singleton. Components never import it — they read through the selector hooks
 * in `useSyncStatus.ts`, which subscribe to one field each. The writer is the task-sync
 * binding layer, which pushes every engine snapshot in here.
 */
export const useSyncStore = create<SyncStore>(set => ({
  ...SYNC_STORE_INITIAL_STATE,
  setSyncState: (next: SyncState): void => {
    // `lastError` is spelled out rather than spread: zustand merges shallowly, so an
    // absent key would leave a stale error on screen after the failure was cleared.
    set({ isOnline: next.isOnline, pendingCount: next.pendingCount, lastError: next.lastError });
  },
}));
