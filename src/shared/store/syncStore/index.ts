export type { SyncErrorKind, SyncState } from './syncStore';
export { SYNC_STORE_INITIAL_STATE, useSyncStore } from './syncStore';
export {
  useFirstSyncError,
  useIsOnline,
  useLastSyncError,
  usePendingCount,
  useSetFirstSyncError,
  useShouldAttempt,
} from './useSyncStatus';
