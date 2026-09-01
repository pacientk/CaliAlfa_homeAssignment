import { FIRST_SYNC_PAGE_SIZE } from '@features/task-sync/model/firstSync';
import { writeTaskCache } from '@features/task-sync/model/syncStorage';
import { useTaskSyncBindings } from '@features/task-sync/model/TaskSyncContext';
import { cachedTaskOf, serverTaskOf } from '@features/task-sync/testing/taskSyncFixtures';
import { resetSyncStore, setupTaskSync } from '@features/task-sync/testing/taskSyncHarness';
import { createMemoryStorage } from '@shared/services/storage';
import { useSyncStore } from '@store/syncStore';
import { act, renderHook, waitFor } from '@testing-library/react-native';

beforeEach(resetSyncStore);

describe('TaskSyncProvider — the first sync', () => {
  it('issues no page request while the device is offline', async () => {
    const harness = setupTaskSync({ isInitiallyOnline: false });

    await renderHook(useTaskSyncBindings, { wrapper: harness.Wrapper });

    expect(harness.pageSource.calls).toEqual([]);
  });

  it('issues it once when the app starts online', async () => {
    const harness = setupTaskSync();
    harness.pageSource.script([serverTaskOf('a1')]);

    await renderHook(useTaskSyncBindings, { wrapper: harness.Wrapper });

    await waitFor(() => {
      expect(harness.pageSource.calls).toEqual([{ page: 1, limit: FIRST_SYNC_PAGE_SIZE }]);
    });
  });

  it('issues it as soon as connectivity returns after an offline start', async () => {
    const harness = setupTaskSync({ isInitiallyOnline: false });
    harness.pageSource.script([serverTaskOf('a1')]);
    await renderHook(useTaskSyncBindings, { wrapper: harness.Wrapper });

    await act(async () => {
      harness.connectivity.setIsOnline(true);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(harness.pageSource.calls).toHaveLength(1);
    });
  });

  it('does not run a second time when the tree re-renders', async () => {
    const harness = setupTaskSync();
    harness.pageSource.script([serverTaskOf('a1')]);
    const { rerender } = await renderHook(useTaskSyncBindings, { wrapper: harness.Wrapper });
    await waitFor(() => {
      expect(harness.pageSource.calls).toHaveLength(1);
    });

    await act(async () => {
      await rerender(undefined);
      useSyncStore.getState().setSyncState({ isOnline: true, pendingCount: 1 });
    });

    expect(harness.pageSource.calls).toHaveLength(1);
  });

  it('publishes the stored list and the connectivity state to its descendants', async () => {
    const storage = createMemoryStorage();
    writeTaskCache(storage, [cachedTaskOf('stored-1')]);
    const harness = setupTaskSync({ storage, isInitiallyOnline: false });

    const { result } = await renderHook(useTaskSyncBindings, { wrapper: harness.Wrapper });

    expect(result.current.engine.getSnapshot().tasks).toHaveLength(1);
    expect(useSyncStore.getState().isOnline).toBe(false);
  });

  it('stops publishing when it unmounts', async () => {
    const harness = setupTaskSync({ isInitiallyOnline: false });
    const { unmount } = await renderHook(useTaskSyncBindings, { wrapper: harness.Wrapper });

    await unmount();
    harness.bindings.engine.enqueueCreate({
      title: 'After unmount',
      description: '',
      category: '',
      isDone: false,
      createdAt: '2026-09-01T12:00:00.000Z',
      expiresAt: null,
    });

    expect(useSyncStore.getState().pendingCount).toBe(0);
  });
});

describe('useTaskSyncBindings', () => {
  it('throws when it is used outside the provider, rather than returning nothing', async () => {
    await expect(renderHook(useTaskSyncBindings)).rejects.toThrow(
      'useTaskSyncBindings must be used inside <TaskSyncProvider>.',
    );
  });
});
