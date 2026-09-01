import type { Task } from '@entities/task/model';
import {
  cachedTaskOf,
  draftOf,
  isoAt,
  serverTaskOf,
} from '@features/task-sync/testing/taskSyncFixtures';
import { resetSyncStore, setupTaskSync } from '@features/task-sync/testing/taskSyncHarness';
import { ApiError } from '@shared/api';
import { createMemoryStorage } from '@shared/services/storage';
import { useSyncStore } from '@store/syncStore';

import type { CachedTask } from '../CachedTask';
import { readMutationQueue, readTaskCache, writeTaskCache } from '../syncStorage';
import type { TaskPageSource } from '../TaskPageSource';
import { taskQueryKeys } from '../taskQueryKeys';

const PAGE_SIZE = 2;

beforeEach(resetSyncStore);

const idsOf = (tasks: readonly CachedTask[]): string[] => tasks.map(task => task.id);

const listInQueryCache = (harness: ReturnType<typeof setupTaskSync>): CachedTask[] | undefined =>
  harness.bindings.queryClient.getQueryData<CachedTask[]>(taskQueryKeys.list);

describe('createTaskSyncBindings — seeding, before anything renders (AC-1)', () => {
  it('holds the stored list in the query cache the moment it is constructed', () => {
    const storage = createMemoryStorage();
    writeTaskCache(storage, [cachedTaskOf('stored-1'), cachedTaskOf('stored-2')]);
    let requestCount = 0;

    const harness = setupTaskSync({
      storage,
      pageSource: {
        fetchTaskPage: (): Promise<Task[]> => {
          requestCount += 1;
          throw new Error('the cache must render before any request is issued');
        },
      },
    });

    expect(listInQueryCache(harness)?.map(task => task.id)).toEqual(['stored-1', 'stored-2']);
    expect(requestCount).toBe(0);
  });

  it('seeds an empty list rather than nothing when storage holds no cache', () => {
    const harness = setupTaskSync();

    expect(listInQueryCache(harness)).toEqual([]);
  });

  it('does not invent tasks the storage never held', () => {
    const storage = createMemoryStorage();
    writeTaskCache(storage, [cachedTaskOf('stored-1')]);

    const harness = setupTaskSync({ storage });

    expect(listInQueryCache(harness)).toHaveLength(1);
  });
});

describe('createTaskSyncBindings — publishing engine snapshots', () => {
  it('publishes the current snapshot into the sync store as soon as it is connected', () => {
    const storage = createMemoryStorage();
    writeTaskCache(storage, [cachedTaskOf('stored-1')]);
    const harness = setupTaskSync({ storage, isInitiallyOnline: false });

    const disconnect = harness.bindings.connect();

    expect(useSyncStore.getState()).toMatchObject({ isOnline: false, pendingCount: 0 });
    disconnect();
  });

  it('pushes a later enqueue into both the query cache and the pending count', () => {
    const harness = setupTaskSync({ isInitiallyOnline: false });
    const disconnect = harness.bindings.connect();

    const created = harness.bindings.engine.enqueueCreate(draftOf());

    expect(listInQueryCache(harness)?.map(task => task.id)).toEqual([created.id]);
    expect(useSyncStore.getState().pendingCount).toBe(1);
    disconnect();
  });

  it('stops publishing once it is disconnected', () => {
    const harness = setupTaskSync({ isInitiallyOnline: false });
    const disconnect = harness.bindings.connect();
    disconnect();

    harness.bindings.engine.enqueueCreate(draftOf());

    expect(listInQueryCache(harness)).toEqual([]);
    expect(useSyncStore.getState().pendingCount).toBe(0);
  });

  it('maps the failure the queue gave up on to its kind, so the banner can word it', async () => {
    const harness = setupTaskSync();
    const disconnect = harness.bindings.connect();
    harness.transport.script('create', { error: new ApiError({ kind: 'client', status: 422 }) });

    harness.bindings.engine.enqueueCreate(draftOf());
    await harness.bindings.engine.drain();

    expect(useSyncStore.getState().lastError).toBe('client');
    disconnect();
  });

  it('leaves the last error absent while every mutation succeeds', async () => {
    const harness = setupTaskSync();
    const disconnect = harness.bindings.connect();
    harness.transport.script('create', { task: serverTaskOf('server-1') });

    harness.bindings.engine.enqueueCreate(draftOf());
    await harness.bindings.engine.drain();

    expect(useSyncStore.getState().lastError).toBeUndefined();
    disconnect();
  });
});

describe('createTaskSyncBindings — syncTasks (AC-4)', () => {
  it('writes every record from all three pages into the cache, read back from storage', async () => {
    const harness = setupTaskSync({ pageSize: PAGE_SIZE });
    harness.pageSource.script(
      [serverTaskOf('a1'), serverTaskOf('a2')],
      [serverTaskOf('b1'), serverTaskOf('b2')],
      [serverTaskOf('c1')],
    );

    await harness.bindings.syncTasks();

    const stored = readTaskCache(harness.storage);
    expect(stored.map(task => task.id).sort()).toEqual(['a1', 'a2', 'b1', 'b2', 'c1']);
    expect(stored.every(task => !task.isLocalId)).toBe(true);
  });

  it('keeps a task whose create is still queued, rather than letting the sync erase it', async () => {
    const harness = setupTaskSync({ pageSize: PAGE_SIZE, isInitiallyOnline: false });
    const local = harness.bindings.engine.enqueueCreate(draftOf({ title: 'Written offline' }));
    harness.pageSource.script([serverTaskOf('a1')]);

    await harness.bindings.syncTasks();

    const stored = readTaskCache(harness.storage);
    expect(stored.map(task => task.id).sort()).toEqual(['a1', local.id].sort());
    expect(readMutationQueue(harness.storage)).toHaveLength(1);
  });

  it('reports the successful sync to connectivity, which is the read path evidence', async () => {
    const harness = setupTaskSync();
    harness.pageSource.script([serverTaskOf('a1')]);

    await harness.bindings.syncTasks();

    expect(harness.connectivity.successCount()).toBe(1);
    expect(harness.connectivity.reportedFailures).toEqual([]);
  });

  it('reports a transport failure to connectivity and rejects rather than swallowing it', async () => {
    const harness = setupTaskSync();
    const failure = { kind: 'transport', cause: new Error('socket closed') } as const;
    harness.pageSource.script(new ApiError(failure));

    await expect(harness.bindings.syncTasks()).rejects.toBeInstanceOf(ApiError);

    expect(harness.connectivity.reportedFailures).toEqual([failure]);
    expect(harness.connectivity.successCount()).toBe(0);
    expect(readTaskCache(harness.storage)).toEqual([]);
  });

  it('replays the queue before it pages, so the list it reads already contains the write', async () => {
    // The page source models the server: it lists a record once the transport has been
    // sent the create. A sync that paged first would read a collection that predates its
    // own queue, and the merge would then erase the very task it just confirmed.
    const listing: TaskPageSource = {
      fetchTaskPage: (): Promise<Task[]> =>
        Promise.resolve(
          harness.transport.calls.some(call => call.kind === 'create')
            ? [serverTaskOf('server-77')]
            : [],
        ),
    };
    const harness = setupTaskSync({ pageSize: PAGE_SIZE, pageSource: listing });
    harness.transport.script('create', { task: serverTaskOf('server-77') });

    harness.bindings.engine.enqueueCreate(draftOf());
    await harness.bindings.syncTasks();

    const stored = readTaskCache(harness.storage);
    expect(idsOf(stored)).toEqual(['server-77']);
    expect(stored[0]?.isLocalId).toBe(false);
    expect(readMutationQueue(harness.storage)).toEqual([]);
  });

  it('stamps the observed moment from the injected clock', async () => {
    const harness = setupTaskSync();
    harness.pageSource.script([serverTaskOf('a1')]);

    await harness.bindings.syncTasks();

    expect(readTaskCache(harness.storage)[0]?.lastLocalWriteAt).toBe(isoAt(1));
  });
});
