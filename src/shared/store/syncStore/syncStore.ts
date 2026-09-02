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
  /** What the app believes about the network. The only field the banner is allowed to read. */
  isOnline: boolean;
  /**
   * Whether a request is worth making now. It goes true on a timer after an outage, to buy the
   * one attempt that can prove a network has recovered — which is why it is not `isOnline` and
   * why nothing user-facing may render it.
   */
  shouldAttempt: boolean;
  pendingCount: number;
  /** The last failure the queue gave up on. Absent once nothing has failed. */
  lastError?: SyncErrorKind;
}

interface SyncStore extends SyncState {
  /** Replaces the whole state. The sync bindings are the only writer. */
  setSyncState(next: SyncState): void;
  /**
   * The first sync's failure, kept out of {@link SyncState} on purpose.
   *
   * `lastError` is the write queue giving up on a change the user made; this is the read
   * path failing to load the list at all. Different events, different remedies: one rolled
   * a change back, the other left the screen showing a cache that may be stale or empty and
   * that nothing is going to refresh on its own. Folding them into one field would make
   * "your change was rejected" and "we could not load anything" the same sentence.
   *
   * It is also why this is not part of the value `setSyncState` replaces — that call is the
   * engine snapshot, and the read path is not in it.
   */
  firstSyncError?: SyncErrorKind;
  /**
   * Set by the first sync, cleared by it on success and by the sheet the user dismisses.
   *
   * Declared as a property rather than a method, unlike `setSyncState` above, because it is
   * the one action a selector hands out as a value: it is read off the store and passed to a
   * component, which detaches it from the object it was declared on. A method signature would
   * be a promise about `this` that the call site does not keep.
   */
  readonly setFirstSyncError: (kind: SyncErrorKind | undefined) => void;
}

/**
 * Optimistic defaults, matching the connectivity service: with no evidence either way,
 * the app assumes it is online and shows no banner rather than flashing one on start.
 */
export const SYNC_STORE_INITIAL_STATE: SyncState = {
  isOnline: true,
  shouldAttempt: true,
  pendingCount: 0,
};

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
    set({
      isOnline: next.isOnline,
      shouldAttempt: next.shouldAttempt,
      pendingCount: next.pendingCount,
      lastError: next.lastError,
    });
  },
  setFirstSyncError: (kind: SyncErrorKind | undefined): void => {
    set({ firstSyncError: kind });
  },
}));
