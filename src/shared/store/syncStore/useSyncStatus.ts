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
