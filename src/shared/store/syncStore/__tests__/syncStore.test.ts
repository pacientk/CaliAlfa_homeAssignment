import { act, renderHook } from '@testing-library/react-native';

import { SYNC_STORE_INITIAL_STATE, useSyncStore } from '../syncStore';
import { useIsOnline, useLastSyncError, usePendingCount } from '../useSyncStatus';

const setSyncState = (
  ...args: Parameters<ReturnType<typeof useSyncStore.getState>['setSyncState']>
): void => {
  useSyncStore.getState().setSyncState(...args);
};

beforeEach(() => {
  setSyncState(SYNC_STORE_INITIAL_STATE);
});

describe('syncStore', () => {
  it('starts optimistic: online, nothing pending, no error', () => {
    expect(useSyncStore.getState()).toMatchObject({
      isOnline: true,
      pendingCount: 0,
      lastError: undefined,
    });
  });

  it('replaces every field it is given', () => {
    setSyncState({ isOnline: false, pendingCount: 3, lastError: 'client' });

    expect(useSyncStore.getState()).toMatchObject({
      isOnline: false,
      pendingCount: 3,
      lastError: 'client',
    });
  });

  it('clears a previous error when the next state has none', () => {
    setSyncState({ isOnline: false, pendingCount: 1, lastError: 'client' });

    setSyncState({ isOnline: true, pendingCount: 0 });

    expect(useSyncStore.getState().lastError).toBeUndefined();
  });

  it('keeps the error while the next state still carries one', () => {
    setSyncState({ isOnline: true, pendingCount: 0, lastError: 'notFound' });

    setSyncState({ isOnline: true, pendingCount: 1, lastError: 'notFound' });

    expect(useSyncStore.getState().lastError).toBe('notFound');
  });
});

describe('sync status selectors', () => {
  it('read their own field', async () => {
    setSyncState({ isOnline: false, pendingCount: 2, lastError: 'server' });

    const online = await renderHook(useIsOnline);
    const pending = await renderHook(usePendingCount);
    const error = await renderHook(useLastSyncError);

    expect(online.result.current).toBe(false);
    expect(pending.result.current).toBe(2);
    expect(error.result.current).toBe('server');
  });

  it('re-render when their own field changes', async () => {
    const { result } = await renderHook(useIsOnline);

    await act(() => {
      setSyncState({ isOnline: false, pendingCount: 0 });
    });

    expect(result.current).toBe(false);
  });

  it('do not re-render a subscriber when an unrelated field changes', async () => {
    let renderCount = 0;
    const { result } = await renderHook(() => {
      renderCount += 1;
      return useIsOnline();
    });
    const rendersAfterMount = renderCount;

    await act(() => {
      setSyncState({ isOnline: true, pendingCount: 7 });
    });

    expect(renderCount).toBe(rendersAfterMount);
    expect(result.current).toBe(true);
  });
});
