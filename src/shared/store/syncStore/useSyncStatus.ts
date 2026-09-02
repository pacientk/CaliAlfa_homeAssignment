import type { SyncErrorKind } from './syncStore';
import { useSyncStore } from './syncStore';

/**
 * One hook per field rather than one returning the whole state: the offline banner
 * re-renders on connectivity, and a component reading the pending count must not
 * re-render every time an unrelated field moves.
 */

export const useIsOnline = (): boolean => useSyncStore(state => state.isOnline);

export const usePendingCount = (): number => useSyncStore(state => state.pendingCount);

export const useLastSyncError = (): SyncErrorKind | undefined =>
  useSyncStore(state => state.lastError);

export const useFirstSyncError = (): SyncErrorKind | undefined =>
  useSyncStore(state => state.firstSyncError);

/**
 * The store action itself rather than a closure over it: zustand compares selector results
 * with `Object.is`, so a selector that built a new function each call would report a change
 * on every unrelated store write. The action's identity is stable for the store's lifetime.
 */
export const useSetFirstSyncError = (): ((kind: SyncErrorKind | undefined) => void) =>
  useSyncStore(state => state.setFirstSyncError);
