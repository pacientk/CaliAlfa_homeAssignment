/** The native safe-area view never lays out under Jest; the sheet reads the bottom inset. */
jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual<typeof SafeAreaContext>('react-native-safe-area-context');

  return { ...actual, useSafeAreaInsets: () => ({ top: 59, right: 0, bottom: 34, left: 0 }) };
});

import { TaskSyncContext } from '@features/task-sync';
import { resetSyncStore, setupTaskSync } from '@features/task-sync/testing/taskSyncHarness';
import { strings } from '@lib/strings';
import { ApiError } from '@shared/api';
import type { SyncErrorKind } from '@store/syncStore';
import { useSyncStore } from '@store/syncStore';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '@ui/tokens';
import type { JSX, ReactNode } from 'react';
import type * as SafeAreaContext from 'react-native-safe-area-context';

import { SyncErrorSheet } from '../SyncErrorSheet';

beforeEach(resetSyncStore);

const SHEET = 'taskList.syncErrorSheet';

/**
 * The context is provided directly rather than through `TaskSyncProvider`, because the
 * provider runs a first sync on mount and every test here is about what the sheet does with
 * a failure that has already happened.
 */
const renderSheet = async (harness: ReturnType<typeof setupTaskSync>): Promise<void> => {
  const wrapper = ({ children }: { children: ReactNode }): JSX.Element => (
    <ThemeProvider>
      <TaskSyncContext.Provider value={harness.bindings}>{children}</TaskSyncContext.Provider>
    </ThemeProvider>
  );

  await render(<SyncErrorSheet />, { wrapper });
};

/**
 * The store write is synchronous, but the sheet presents through a native modal that lands a
 * tick later — so this waits for the sheet rather than assuming it is up, which is also what
 * keeps every test below from asserting against a frame that has not been drawn.
 */
const recordFailure = async (kind: SyncErrorKind): Promise<void> => {
  await act(() => {
    useSyncStore.getState().setFirstSyncError(kind);
  });

  await waitFor(() => {
    expect(screen.getByTestId(SHEET)).toBeTruthy();
  });
};

describe('the sheet that reports a first sync the server refused', () => {
  it('stays out of the way while the read path has not failed', async () => {
    await renderSheet(setupTaskSync());

    expect(screen.queryByTestId(SHEET)).toBeNull();
  });

  it('names the failure it is reporting rather than showing one message for all of them', async () => {
    await renderSheet(setupTaskSync());

    await recordFailure('server');
    expect(screen.getByText(strings.syncErrorSheet.message.server)).toBeTruthy();

    await recordFailure('notFound');
    expect(screen.getByText(strings.syncErrorSheet.message.notFound)).toBeTruthy();
    expect(screen.queryByText(strings.syncErrorSheet.message.server)).toBeNull();
  });

  it('says the tasks are still on the device, which is what the screen behind it cannot show', async () => {
    await renderSheet(setupTaskSync());
    await recordFailure('server');

    expect(screen.getByText(/copy saved on this device/i)).toBeTruthy();
  });

  it('goes away when dismissed, and does not come back on its own', async () => {
    await renderSheet(setupTaskSync());
    await recordFailure('server');

    await fireEvent.press(screen.getByTestId(`${SHEET}.close`));

    expect(screen.queryByTestId(SHEET)).toBeNull();
    expect(useSyncStore.getState().firstSyncError).toBeUndefined();
  });

  it('runs the sync again when asked, and closes once it succeeds', async () => {
    const harness = setupTaskSync();
    harness.pageSource.script([]);
    await renderSheet(harness);
    await recordFailure('server');

    await fireEvent.press(screen.getByTestId(`${SHEET}.retry`));

    await waitFor(() => {
      expect(screen.queryByTestId(SHEET)).toBeNull();
    });
    expect(harness.pageSource.calls).toHaveLength(1);
  });

  it('stays open, and offers the retry again, when the retry fails the same way', async () => {
    const harness = setupTaskSync();
    harness.pageSource.script(new ApiError({ kind: 'server', status: 503 }));
    await renderSheet(harness);
    await recordFailure('server');

    await fireEvent.press(screen.getByTestId(`${SHEET}.retry`));

    expect(screen.getByTestId(SHEET)).toBeTruthy();
    expect(screen.getByText(strings.syncErrorSheet.retry)).toBeTruthy();
  });

  it('reports that it is working while the retry is in flight', async () => {
    let releasePage: (() => void) | undefined;
    let requestCount = 0;
    const harness = setupTaskSync({
      pageSource: {
        fetchTaskPage: (): Promise<never[]> => {
          requestCount += 1;
          return new Promise(resolve => {
            releasePage = (): void => {
              resolve([]);
            };
          });
        },
      },
    });

    await renderSheet(harness);
    await recordFailure('server');

    await fireEvent.press(screen.getByTestId(`${SHEET}.retry`));

    expect(screen.getByText(strings.syncErrorSheet.retrying)).toBeTruthy();
    // Asserted on the control, not by counting requests: React Query de-duplicates a second
    // fetch of the same key, so the request count stays at one whether or not the button is
    // disabled. What the disabled state buys is a control that tells the user — and a screen
    // reader — that the press landed and is being worked on.
    expect(screen.getByTestId(`${SHEET}.retry`)).toBeDisabled();

    await fireEvent.press(screen.getByTestId(`${SHEET}.retry`));
    expect(requestCount).toBe(1);

    releasePage?.();
    await waitFor(() => {
      expect(screen.queryByTestId(SHEET)).toBeNull();
    });
  });
});
