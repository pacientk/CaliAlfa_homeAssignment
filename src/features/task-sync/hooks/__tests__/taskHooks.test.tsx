import type { CachedTask } from '@features/task-sync/model/CachedTask';
import {
  readMutationQueue,
  readTaskCache,
  writeTaskCache,
} from '@features/task-sync/model/syncStorage';
import {
  cachedTaskOf,
  draftOf,
  isoAt,
  serverTaskOf,
} from '@features/task-sync/testing/taskSyncFixtures';
import type { TaskSyncHarness } from '@features/task-sync/testing/taskSyncHarness';
import { resetSyncStore, setupTaskSync } from '@features/task-sync/testing/taskSyncHarness';
import { ApiError } from '@shared/api';
import { createMemoryStorage } from '@shared/services/storage';
import { act, render, renderHook, waitFor } from '@testing-library/react-native';

import { useClearSyncError } from '../useClearSyncError';
import { useCreateTask } from '../useCreateTask';
import { useDeleteTask } from '../useDeleteTask';
import { useTask } from '../useTask';
import { useTasks } from '../useTasks';
import { useToggleTaskDone } from '../useToggleTaskDone';
import { useUpdateTask } from '../useUpdateTask';

const PAGE_SIZE = 2;

beforeEach(resetSyncStore);

interface TaskApi {
  tasks: CachedTask[];
  createTask: ReturnType<typeof useCreateTask>;
  updateTask: ReturnType<typeof useUpdateTask>;
  deleteTask: ReturnType<typeof useDeleteTask>;
  toggleTaskDone: ReturnType<typeof useToggleTaskDone>;
  clearSyncError: ReturnType<typeof useClearSyncError>;
}

const useTaskApi = (): TaskApi => ({
  tasks: useTasks(),
  createTask: useCreateTask(),
  updateTask: useUpdateTask(),
  deleteTask: useDeleteTask(),
  toggleTaskDone: useToggleTaskDone(),
  clearSyncError: useClearSyncError(),
});

const mountTaskApi = async (harness: TaskSyncHarness): Promise<{ current: TaskApi }> => {
  const { result } = await renderHook(useTaskApi, { wrapper: harness.Wrapper });
  return result;
};

const idsOf = (tasks: readonly CachedTask[]): string[] => tasks.map(task => task.id);

// --- S-1 / AC-1 -------------------------------------------------------------

describe('S-1 — a populated cache renders before any request is issued (AC-1)', () => {
  const seededHarness = (): TaskSyncHarness => {
    const storage = createMemoryStorage();
    writeTaskCache(storage, [cachedTaskOf('stored-1'), cachedTaskOf('stored-2')]);
    return setupTaskSync({ storage, isInitiallyOnline: false });
  };

  it('the first render already contains the cached tasks', async () => {
    const harness = seededHarness();
    const renders: CachedTask[][] = [];
    const Probe = (): null => {
      renders.push(useTasks());
      return null;
    };

    await render(
      <harness.Wrapper>
        <Probe />
      </harness.Wrapper>,
    );

    expect(idsOf(renders[0] ?? [])).toEqual(['stored-1', 'stored-2']);
  });

  it('issues no request at all while the device is offline', async () => {
    const harness = seededHarness();

    await mountTaskApi(harness);

    expect(harness.pageSource.calls).toEqual([]);
    expect(harness.transport.calls).toEqual([]);
  });

  it('does issue the first sync when the same mount happens online', async () => {
    const storage = createMemoryStorage();
    writeTaskCache(storage, [cachedTaskOf('stored-1')]);
    const harness = setupTaskSync({ storage });

    await mountTaskApi(harness);

    await waitFor(() => {
      expect(harness.pageSource.calls).toHaveLength(1);
    });
  });

  it('renders an empty list, not a stale one, when storage holds no cache', async () => {
    const harness = setupTaskSync({ isInitiallyOnline: false });

    const result = await mountTaskApi(harness);

    expect(result.current.tasks).toEqual([]);
  });

  it('orders the list newest first, whatever order the cache was stored in', async () => {
    const storage = createMemoryStorage();
    writeTaskCache(storage, [
      cachedTaskOf('older', { createdAt: isoAt(1) }),
      cachedTaskOf('newest', { createdAt: isoAt(9) }),
      cachedTaskOf('middle', { createdAt: isoAt(5) }),
    ]);
    const harness = setupTaskSync({ storage, isInitiallyOnline: false });

    const result = await mountTaskApi(harness);

    expect(idsOf(result.current.tasks)).toEqual(['newest', 'middle', 'older']);
  });
});

// --- S-2 / AC-2 -------------------------------------------------------------

describe('S-2 — a create resolves before the network does (AC-2)', () => {
  it('returns the task, queues the entry, and caches it while the request is in flight', async () => {
    const harness = setupTaskSync();
    harness.pageSource.script([]);
    const result = await mountTaskApi(harness);
    await waitFor(() => {
      expect(harness.pageSource.calls).toHaveLength(1);
    });
    // The response never settles, so everything asserted below happened without the
    // network having been awaited.
    harness.transport.script('create', { isPending: true });

    let created: CachedTask | undefined;
    await act(() => {
      created = result.current.createTask(draftOf({ title: 'Written offline' }));
    });

    expect(created?.isLocalId).toBe(true);
    const queue = readMutationQueue(harness.storage);
    expect(queue).toHaveLength(1);
    expect(queue[0]?.kind).toBe('create');
    expect(queue[0]?.taskId).toBe(created?.id);
    expect(idsOf(readTaskCache(harness.storage))).toEqual([created?.id]);
    expect(idsOf(result.current.tasks)).toEqual([created?.id]);
    expect(harness.transport.calls).toHaveLength(1);
  });

  it('accepts the create with no request at all while offline', async () => {
    const harness = setupTaskSync({ isInitiallyOnline: false });
    const result = await mountTaskApi(harness);

    let created: CachedTask | undefined;
    await act(() => {
      created = result.current.createTask(draftOf());
    });

    expect(harness.transport.calls).toEqual([]);
    expect(readMutationQueue(harness.storage)).toHaveLength(1);
    expect(idsOf(readTaskCache(harness.storage))).toEqual([created?.id]);
  });

  it('survives a restart: a second engine over the same storage sees the queued create', async () => {
    const storage = createMemoryStorage();
    const harness = setupTaskSync({ storage, isInitiallyOnline: false });
    const result = await mountTaskApi(harness);
    await act(() => {
      result.current.createTask(draftOf({ title: 'Written offline' }));
    });

    const restarted = setupTaskSync({ storage, isInitiallyOnline: false });
    const restartedResult = await mountTaskApi(restarted);

    expect(restartedResult.current.tasks.map(task => task.title)).toEqual(['Written offline']);
    expect(readMutationQueue(restarted.storage)).toHaveLength(1);
  });
});

// --- S-3 / AC-3 -------------------------------------------------------------

describe('S-3 — the drain reconciles the cache and clears the pending count (AC-3)', () => {
  const arrange = async (): Promise<{
    harness: TaskSyncHarness;
    result: { current: TaskApi };
    localId: string;
  }> => {
    const harness = setupTaskSync({ isInitiallyOnline: false });
    const result = await mountTaskApi(harness);
    let localId = '';
    await act(() => {
      localId = result.current.createTask(draftOf()).id;
    });
    return { harness, result, localId };
  };

  it('replaces the local id with the server record and empties the queue', async () => {
    const { harness, result, localId } = await arrange();
    harness.transport.script('create', { task: serverTaskOf('server-77') });
    harness.pageSource.script([serverTaskOf('server-77')]);

    await act(async () => {
      harness.connectivity.setIsOnline(true);
      await harness.bindings.engine.drain();
    });

    const stored = readTaskCache(harness.storage);
    expect(idsOf(stored)).toEqual(['server-77']);
    expect(stored[0]?.isLocalId).toBe(false);
    expect(readMutationQueue(harness.storage)).toEqual([]);
    expect(idsOf(result.current.tasks)).toEqual(['server-77']);
    expect(localId).not.toBe('server-77');
  });

  it('keeps the entry queued when the failure is retryable', async () => {
    const { harness, result } = await arrange();
    harness.transport.script('create', { error: new ApiError({ kind: 'server', status: 503 }) });

    await act(async () => {
      harness.connectivity.setIsOnline(true);
      await harness.bindings.engine.drain();
    });

    expect(readMutationQueue(harness.storage)).toHaveLength(1);
    expect(result.current.tasks).toHaveLength(1);
  });

  it('rolls the optimistic task back when the failure is terminal', async () => {
    const { harness, result } = await arrange();
    harness.transport.script('create', { error: new ApiError({ kind: 'client', status: 400 }) });

    await act(async () => {
      harness.connectivity.setIsOnline(true);
      await harness.bindings.engine.drain();
    });

    expect(readTaskCache(harness.storage)).toEqual([]);
    expect(readMutationQueue(harness.storage)).toEqual([]);
    expect(result.current.tasks).toEqual([]);
  });

  it('sends a later update against the server id, not the local one', async () => {
    const { harness, result, localId } = await arrange();
    harness.advanceClock();
    await act(() => {
      result.current.updateTask(localId, { title: 'Renamed' });
    });
    harness.transport.script('create', { task: serverTaskOf('server-77') });
    harness.transport.script('update', { task: serverTaskOf('server-77', { title: 'Renamed' }) });
    harness.pageSource.script([serverTaskOf('server-77', { title: 'Renamed' })]);

    await act(async () => {
      harness.connectivity.setIsOnline(true);
      await harness.bindings.engine.drain();
    });

    const updateCall = harness.transport.calls.find(call => call.kind === 'update');
    expect(updateCall?.taskId).toBe('server-77');
    expect(readMutationQueue(harness.storage)).toEqual([]);
  });
});

// --- S-4 / AC-4 -------------------------------------------------------------

describe('S-4 — the first sync pages the collection (AC-4)', () => {
  it('lands every record from all three pages in the cache, read back from storage', async () => {
    const harness = setupTaskSync({ pageSize: PAGE_SIZE });
    harness.pageSource.script(
      [serverTaskOf('a1'), serverTaskOf('a2')],
      [serverTaskOf('b1'), serverTaskOf('b2')],
      [serverTaskOf('c1')],
    );

    const result = await mountTaskApi(harness);

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(5);
    });
    expect(idsOf(readTaskCache(harness.storage)).sort()).toEqual(['a1', 'a2', 'b1', 'b2', 'c1']);
    expect(harness.pageSource.calls).toHaveLength(3);
  });

  it('leaves the cache untouched when the first sync fails', async () => {
    const storage = createMemoryStorage();
    writeTaskCache(storage, [cachedTaskOf('stored-1')]);
    const harness = setupTaskSync({ storage });
    harness.pageSource.script(new ApiError({ kind: 'transport', cause: new Error('down') }));

    const result = await mountTaskApi(harness);

    await waitFor(() => {
      expect(harness.pageSource.calls).toHaveLength(1);
    });
    expect(idsOf(readTaskCache(harness.storage))).toEqual(['stored-1']);
    expect(idsOf(result.current.tasks)).toEqual(['stored-1']);
  });
});

// --- the remaining hooks ----------------------------------------------------

describe('useTask', () => {
  it('returns the task with the given id', async () => {
    const storage = createMemoryStorage();
    writeTaskCache(storage, [cachedTaskOf('stored-1'), cachedTaskOf('stored-2')]);
    const harness = setupTaskSync({ storage, isInitiallyOnline: false });

    const { result } = await renderHook(() => useTask('stored-2'), { wrapper: harness.Wrapper });

    expect(result.current?.id).toBe('stored-2');
  });

  it('returns undefined for an id the cache does not hold', async () => {
    const harness = setupTaskSync({ isInitiallyOnline: false });

    const { result } = await renderHook(() => useTask('missing'), { wrapper: harness.Wrapper });

    expect(result.current).toBeUndefined();
  });
});

describe('useUpdateTask', () => {
  const seeded = (): TaskSyncHarness => {
    const storage = createMemoryStorage();
    writeTaskCache(storage, [cachedTaskOf('stored-1')]);
    return setupTaskSync({ storage, isInitiallyOnline: false });
  };

  it('applies the change to the cache and queues one entry', async () => {
    const harness = seeded();
    const result = await mountTaskApi(harness);

    await act(() => {
      result.current.updateTask('stored-1', { title: 'Renamed' });
    });

    expect(readTaskCache(harness.storage)[0]?.title).toBe('Renamed');
    expect(readMutationQueue(harness.storage)).toHaveLength(1);
    expect(result.current.tasks[0]?.title).toBe('Renamed');
  });

  it('queues nothing and returns undefined for a task the cache does not hold', async () => {
    const harness = seeded();
    const result = await mountTaskApi(harness);

    let updated: CachedTask | undefined | 'unset' = 'unset';
    await act(() => {
      updated = result.current.updateTask('missing', { title: 'Renamed' });
    });

    expect(updated).toBeUndefined();
    expect(readMutationQueue(harness.storage)).toEqual([]);
    expect(readTaskCache(harness.storage)[0]?.title).toBe('Ship the data layer');
  });
});

describe('useToggleTaskDone', () => {
  const seeded = (isDone: boolean): TaskSyncHarness => {
    const storage = createMemoryStorage();
    writeTaskCache(storage, [cachedTaskOf('stored-1', { isDone })]);
    return setupTaskSync({ storage, isInitiallyOnline: false });
  };

  it('completes a task', async () => {
    const harness = seeded(false);
    const result = await mountTaskApi(harness);

    await act(() => {
      result.current.toggleTaskDone('stored-1', true);
    });

    expect(readTaskCache(harness.storage)[0]?.isDone).toBe(true);
    expect(readMutationQueue(harness.storage)[0]?.kind).toBe('update');
  });

  it('un-completes a task, so completion toggles in both directions', async () => {
    const harness = seeded(true);
    const result = await mountTaskApi(harness);

    await act(() => {
      result.current.toggleTaskDone('stored-1', false);
    });

    expect(readTaskCache(harness.storage)[0]?.isDone).toBe(false);
  });

  it('does not reorder the list when a task is completed', async () => {
    const storage = createMemoryStorage();
    writeTaskCache(storage, [
      cachedTaskOf('newest', { createdAt: isoAt(9) }),
      cachedTaskOf('older', { createdAt: isoAt(1) }),
    ]);
    const harness = setupTaskSync({ storage, isInitiallyOnline: false });
    const result = await mountTaskApi(harness);

    await act(() => {
      result.current.toggleTaskDone('newest', true);
    });

    expect(idsOf(result.current.tasks)).toEqual(['newest', 'older']);
  });
});

describe('useDeleteTask', () => {
  it('removes the task from the cache and queues the delete', async () => {
    const storage = createMemoryStorage();
    writeTaskCache(storage, [cachedTaskOf('stored-1'), cachedTaskOf('stored-2')]);
    const harness = setupTaskSync({ storage, isInitiallyOnline: false });
    const result = await mountTaskApi(harness);

    await act(() => {
      result.current.deleteTask('stored-1');
    });

    expect(idsOf(readTaskCache(harness.storage))).toEqual(['stored-2']);
    expect(readMutationQueue(harness.storage)[0]?.kind).toBe('delete');
    expect(idsOf(result.current.tasks)).toEqual(['stored-2']);
  });

  it('queues nothing for a task the cache does not hold', async () => {
    const storage = createMemoryStorage();
    writeTaskCache(storage, [cachedTaskOf('stored-1')]);
    const harness = setupTaskSync({ storage, isInitiallyOnline: false });
    const result = await mountTaskApi(harness);

    await act(() => {
      result.current.deleteTask('missing');
    });

    expect(readMutationQueue(harness.storage)).toEqual([]);
    expect(idsOf(readTaskCache(harness.storage))).toEqual(['stored-1']);
  });
});
