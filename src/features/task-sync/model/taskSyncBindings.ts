import { isApiError } from '@shared/api';
import type { ConnectivityService, ScheduleTimer } from '@shared/services/connectivity';
import { createOutcomeConnectivity } from '@shared/services/connectivity';
import type { KeyValueStorage } from '@shared/services/storage';
import { mmkvStorage } from '@shared/services/storage';
import { useSyncStore } from '@store/syncStore';
import { QueryClient } from '@tanstack/react-query';

import type { CachedTask } from './CachedTask';
import { createLocalId } from './createLocalId';
import { fetchAllTasks, FIRST_SYNC_PAGE_SIZE } from './firstSync';
import type { TaskPageSource } from './TaskPageSource';
import { defaultTaskPageSource } from './TaskPageSource';
import { taskQueryKeys } from './taskQueryKeys';
import type { TaskSyncEngine } from './taskSyncEngine';
import { createTaskSyncEngine } from './taskSyncEngine';
import type { TaskTransport } from './TaskTransport';
import { defaultTaskTransport } from './TaskTransport';

/**
 * Everything React needs from the offline core, assembled once.
 *
 * It is a plain factory rather than a hook so the wiring that FR-18 depends on — the
 * query cache holding the stored list before anything renders — happens at construction
 * and can be asserted without mounting a component.
 */
export interface TaskSyncBindings {
  engine: TaskSyncEngine;
  /** Already seeded with the stored task list. */
  queryClient: QueryClient;
  /**
   * The first sync: pages the collection, then merges it into the cache. Declared as a
   * property rather than a method because it is handed to the query client as a value.
   */
  syncTasks: () => Promise<CachedTask[]>;
  /** Starts publishing engine snapshots into the query cache and the sync store. */
  connect: () => () => void;
}

export interface TaskSyncBindingsOptions {
  storage: KeyValueStorage;
  connectivity: ConnectivityService;
  transport: TaskTransport;
  pageSource: TaskPageSource;
  /** ISO-8601 clock. Injected so tests do not have to mock time globally. */
  now: () => string;
  createId: () => string;
  scheduleTimer: ScheduleTimer;
  pageSize: number;
}

const nowIso = (): string => new Date().toISOString();

/**
 * Query defaults for an app whose read model is a local cache.
 *
 * - `networkMode: 'always'` — the connectivity service is the single authority on whether
 *   this app is online, and it derives that from real request outcomes. Leaving the
 *   library's own online manager in the loop would give two answers to one question.
 * - `staleTime` and `gcTime` infinite — the list is never refetched behind the user's back
 *   and is never garbage collected while no screen observes it. Collecting it would empty
 *   the seeded cache and cost exactly the cold-start render FR-18 exists to protect.
 * - `retry: false` — a failed first sync is retried when connectivity returns, which the
 *   provider already watches. A second backoff policy on top of that one would double the
 *   traffic of a bad network without shortening the outage.
 */
const createTaskQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        networkMode: 'always',
        staleTime: Infinity,
        gcTime: Infinity,
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  });

export const createTaskSyncBindings = (
  options: Partial<TaskSyncBindingsOptions> = {},
): TaskSyncBindings => {
  const storage = options.storage ?? mmkvStorage;
  const connectivity = options.connectivity ?? createOutcomeConnectivity();
  const pageSource = options.pageSource ?? defaultTaskPageSource;
  const now = options.now ?? nowIso;
  const pageSize = options.pageSize ?? FIRST_SYNC_PAGE_SIZE;

  const engine = createTaskSyncEngine({
    storage,
    connectivity,
    transport: options.transport ?? defaultTaskTransport,
    now,
    createId: options.createId ?? createLocalId,
    scheduleTimer: options.scheduleTimer,
  });

  const queryClient = createTaskQueryClient();

  /**
   * The engine's snapshot, published to its two React consumers. One writer, so the
   * query cache and the banner can never disagree about what the queue is doing.
   */
  const publish = (): void => {
    const snapshot = engine.getSnapshot();
    queryClient.setQueryData<CachedTask[]>(taskQueryKeys.list, snapshot.tasks);
    useSyncStore.getState().setSyncState({
      isOnline: snapshot.isOnline,
      shouldAttempt: snapshot.shouldAttempt,
      pendingCount: snapshot.pendingCount,
      lastError: snapshot.lastFailure?.kind,
    });
  };

  // Synchronously, at construction. MMKV reads are synchronous and the engine has already
  // done its read, so the stored list is in the query cache before the first render rather
  // than after the first effect — which is FR-18, and the reason this is not a hook.
  queryClient.setQueryData<CachedTask[]>(taskQueryKeys.list, engine.getSnapshot().tasks);

  const syncTasks = async (): Promise<CachedTask[]> => {
    // Whatever is already queued goes first. The merge treats the server's list as
    // authoritative for every record it is not told to protect, so a create that had not
    // reached the server when this page was read would be erased by its own first sync.
    // Draining before paging is what makes the two agree; `drain` never rejects.
    await engine.drain();
    try {
      const serverTasks = await fetchAllTasks(pageSource, pageSize);
      connectivity.reportSuccess();
      engine.mergeServerTasks(serverTasks, now());
      useSyncStore.getState().setFirstSyncError(undefined);
    } catch (error) {
      // The read path is evidence about the network too, not only the drain. Without
      // this a cold start with no connection would leave the banner claiming to be
      // online until the user's first write failed.
      if (isApiError(error)) {
        connectivity.reportFailure(error.failure);
        // Whether this needs saying out loud is decided by what connectivity just
        // concluded, rather than by re-listing the kinds here — that list already exists
        // in `reportFailure`, and a second copy is how the two would drift apart.
        //
        // Offline means the banner is already saying it and the probe will come back on
        // its own. Anything else means the server answered and failed: connectivity stays
        // online, so nothing re-runs this sync, and without a sheet the user is left with
        // a stale or empty list and no way to tell.
        if (connectivity.getIsOnline()) {
          useSyncStore.getState().setFirstSyncError(error.failure.kind);
        }
      }
      throw error;
    }
    return engine.getSnapshot().tasks;
  };

  return {
    engine,
    queryClient,
    syncTasks,
    connect: (): (() => void) => {
      publish();
      return engine.subscribe(publish);
    },
  };
};
