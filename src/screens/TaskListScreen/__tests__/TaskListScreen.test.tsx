/**
 * FlashList measures itself through native layout calls that do not exist under Jest — the
 * same stubs `AppFlashList`'s own suite applies, for the same reason.
 */
jest.mock('@shopify/flash-list/dist/recyclerview/utils/measureLayout', () => {
  const actual = jest.requireActual<Record<string, unknown>>(
    '@shopify/flash-list/dist/recyclerview/utils/measureLayout',
  );

  return {
    ...actual,
    measureParentSize: jest.fn(() => ({ x: 0, y: 0, width: 402, height: 874 })),
    measureFirstChildLayout: jest.fn(() => ({ x: 0, y: 0, width: 402, height: 874 })),
    measureItemLayout: jest.fn(() => ({ x: 0, y: 0, width: 402, height: 72 })),
  };
});

/** The native safe-area view never lays out here; see the note in `RootNavigator.test.tsx`. */
jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual<typeof SafeAreaContext>('react-native-safe-area-context');
  const insets = { top: 59, right: 0, bottom: 34, left: 0 };
  const frame = { x: 0, y: 0, width: 402, height: 874 };

  return {
    ...actual,
    SafeAreaProvider: ({ children }: { children: ReactNode }) => children,
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => frame,
  };
});

import type { Task } from '@entities/task';
import { propOf } from '@features/auth/testing/renderedElement';
import type { CachedTask } from '@features/task-sync';
import { readMutationQueue, writeTaskCache } from '@features/task-sync';
import { cachedTaskOf, isoAt } from '@features/task-sync/testing/taskSyncFixtures';
import type { TaskSyncHarness } from '@features/task-sync/testing/taskSyncHarness';
import { resetSyncStore, setupTaskSync } from '@features/task-sync/testing/taskSyncHarness';
import { strings } from '@lib/strings';
import { createMemoryStorage } from '@shared/services/storage';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { lightTheme, ThemeProvider } from '@ui/tokens';
import type { JSX, ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';
import type * as SafeAreaContext from 'react-native-safe-area-context';

import { TaskListScreen } from '../TaskListScreen';

const DEBOUNCE_MS = 200;
const PAST_EXPIRY = '2020-01-01T00:00:00.000Z';
const FUTURE_EXPIRY = '2099-01-01T00:00:00.000Z';

/** Only the row roots: the parts of a row carry a further dotted suffix. */
const ROW_ROOT = /^taskList\.row\.[^.]+$/;

interface ScreenHandlers {
  onCreateTask: jest.Mock<void, []>;
  onOpenTask: jest.Mock<void, [string]>;
}

interface MountedScreen {
  harness: TaskSyncHarness;
  handlers: ScreenHandlers;
}

const taskOf = (id: string, step: number, overrides: Partial<CachedTask> = {}): CachedTask =>
  cachedTaskOf(id, { title: `Task ${id}`, createdAt: isoAt(step), ...overrides });

/** The cached record as the server would have returned it — without the local bookkeeping. */
const toServerTask = (task: CachedTask): Task => ({
  id: task.id,
  title: task.title,
  description: task.description,
  category: task.category,
  isDone: task.isDone,
  createdAt: task.createdAt,
  ...(task.expiresAt === undefined ? {} : { expiresAt: task.expiresAt }),
});

/**
 * Seeds the cache, then scripts the same records as the server's first page.
 *
 * Both halves matter. Without the cache the screen has nothing to draw on the first frame;
 * without the scripted page the first sync would answer with an empty collection and the
 * merge would — correctly — wipe the list the test had just seeded.
 */
const mountScreen = async (
  tasks: readonly CachedTask[],
  isInitiallyOnline = true,
): Promise<MountedScreen> => {
  const storage = createMemoryStorage();
  writeTaskCache(storage, [...tasks]);
  const harness = setupTaskSync({ storage, isInitiallyOnline });
  harness.pageSource.script(tasks.map(toServerTask));

  const handlers: ScreenHandlers = {
    onCreateTask: jest.fn<void, []>(),
    onOpenTask: jest.fn<void, [string]>(),
  };

  const Wrapper = ({ children }: { children: ReactNode }): JSX.Element => (
    <harness.Wrapper>
      <ThemeProvider>{children}</ThemeProvider>
    </harness.Wrapper>
  );

  await render(
    <TaskListScreen onCreateTask={handlers.onCreateTask} onOpenTask={handlers.onOpenTask} />,
    { wrapper: Wrapper },
  );

  await settle();

  return { harness, handlers };
};

/** Lets the list's own layout timers and any queued state updates run. */
const settle = async (): Promise<void> => {
  await act(async () => {
    jest.runOnlyPendingTimers();
    await Promise.resolve();
  });
};

const advanceDebounce = async (): Promise<void> => {
  await act(async () => {
    jest.advanceTimersByTime(DEBOUNCE_MS);
    await Promise.resolve();
  });
};

const rowIds = (): string[] =>
  screen
    .getAllByTestId(ROW_ROOT)
    .map(node => String(node.props.testID).replace('taskList.row.', ''));

const typeSearch = async (query: string): Promise<void> => {
  await fireEvent.changeText(screen.getByLabelText(strings.taskList.search.label), query);
  await advanceDebounce();
};

beforeEach(() => {
  jest.useFakeTimers();
  resetSyncStore();
});

// --- S-5 / AC-6 --------------------------------------------------------------

describe('S-5 — completing a task leaves it where it is and moves the counter (AC-6)', () => {
  const threeTasks = (): CachedTask[] => [taskOf('a', 1), taskOf('b', 2), taskOf('c', 3)];

  it('draws the list newest first', async () => {
    await mountScreen(threeTasks());

    expect(rowIds()).toEqual(['c', 'b', 'a']);
  });

  // Offline, so the optimistic result is what stays on screen: the fake transport answers a
  // drained update with a stock server record, which is a property of the double and not of
  // this screen. The round trip itself is `task-sync`'s own suite to prove.
  it('keeps a row in place when it is completed, and counts it on the momentum card', async () => {
    const { harness } = await mountScreen(threeTasks(), false);

    expect(screen.getByText(strings.taskList.momentum.progress(0, 3))).toBeTruthy();

    await fireEvent.press(screen.getByTestId('taskList.row.b.checkbox'));
    await settle();

    expect(rowIds()).toEqual(['c', 'b', 'a']);
    expect(screen.getByText(strings.taskList.momentum.progress(1, 3))).toBeTruthy();
    expect(screen.getByTestId('taskList.row.b.title')).toHaveStyle({
      textDecorationLine: 'line-through',
    });
    expect(readMutationQueue(harness.storage)).toMatchObject([
      { kind: 'update', taskId: 'b', payload: { isDone: true } },
    ]);
  });

  it('unticks in the other direction, and the counter comes back down', async () => {
    const { harness } = await mountScreen(
      [taskOf('a', 1, { isDone: true }), taskOf('b', 2)],
      false,
    );

    expect(screen.getByText(strings.taskList.momentum.progress(1, 2))).toBeTruthy();

    await fireEvent.press(screen.getByTestId('taskList.row.a.checkbox'));
    await settle();

    expect(rowIds()).toEqual(['b', 'a']);
    expect(screen.getByText(strings.taskList.momentum.progress(0, 2))).toBeTruthy();
    expect(readMutationQueue(harness.storage)).toMatchObject([
      { kind: 'update', taskId: 'a', payload: { isDone: false } },
    ]);
  });
});

// --- AC-1 / AC-2 / AC-3 at screen level --------------------------------------

describe('expiry is derived from the clock, not from a stored flag (AC-1, AC-2, AC-3)', () => {
  // Offline, so a press that should not have happened leaves visible evidence in the queue
  // rather than being absorbed by a drain and a server echo.
  it('recesses a row whose expiry has passed and refuses its checkbox', async () => {
    const { harness } = await mountScreen([taskOf('gone', 1, { expiresAt: PAST_EXPIRY })], false);

    expect(screen.getByTestId('taskList.row.gone.card')).toHaveStyle({
      backgroundColor: lightTheme.colors.surface.container,
    });

    await fireEvent.press(screen.getByTestId('taskList.row.gone.checkbox'));
    await settle();

    expect(screen.getByTestId('taskList.row.gone.title')).not.toHaveStyle({
      textDecorationLine: 'line-through',
    });
    expect(readMutationQueue(harness.storage)).toEqual([]);
  });

  it('leaves a row with a future expiry alone', async () => {
    await mountScreen([taskOf('live', 1, { expiresAt: FUTURE_EXPIRY })]);

    expect(screen.getByTestId('taskList.row.live.card')).toHaveStyle({
      backgroundColor: lightTheme.colors.surface.lowest,
    });
  });

  it('keeps the completed treatment on a task that was done before it expired (AC-3)', async () => {
    await mountScreen([taskOf('done', 1, { expiresAt: PAST_EXPIRY, isDone: true })]);

    expect(screen.getByTestId('taskList.row.done.checkbox')).toHaveStyle({
      backgroundColor: lightTheme.colors.feedback.success,
    });
    expect(screen.getByTestId('taskList.row.done.title')).toHaveStyle({
      textDecorationLine: 'line-through',
    });
  });

  it('still opens the action menu on an expired row (AC-2)', async () => {
    await mountScreen([taskOf('gone', 1, { expiresAt: PAST_EXPIRY })]);

    await fireEvent.press(screen.getByTestId('taskList.row.gone.actions'));
    await settle();

    expect(screen.getByTestId('taskList.row.gone.menu')).toBeTruthy();
  });
});

// --- S-3 / AC-4 --------------------------------------------------------------

describe('S-3 — the two empty states are distinct (AC-4, FR-17)', () => {
  it('shows the no-tasks state, and no search field, when nothing has ever been added', async () => {
    await mountScreen([]);

    expect(screen.getByTestId('taskList.noTasks')).toBeTruthy();
    expect(screen.getByText(strings.taskList.noTasks.title)).toBeTruthy();
    expect(screen.queryByTestId('taskList.noResults')).toBeNull();
    expect(screen.queryByLabelText(strings.taskList.search.label)).toBeNull();
    expect(screen.getByText(strings.taskList.momentum.empty)).toBeTruthy();
  });

  it('shows the no-results state, naming the query, when a search hides everything', async () => {
    await mountScreen([taskOf('a', 1), taskOf('b', 2)]);

    await typeSearch('passport');

    expect(screen.getByTestId('taskList.noResults')).toBeTruthy();
    expect(screen.getByText(strings.taskList.noResults.title('passport'))).toBeTruthy();
    expect(screen.getByText(strings.taskList.noResults.message(2))).toBeTruthy();
    expect(screen.queryByTestId('taskList.noTasks')).toBeNull();
    expect(screen.queryByText(strings.taskList.noTasks.title)).toBeNull();
  });

  it('offers the two states different ways out — create a task, or clear the search', async () => {
    const { handlers } = await mountScreen([taskOf('a', 1)]);

    await typeSearch('passport');
    await fireEvent.press(screen.getByTestId('taskList.noResults.action'));
    await settle();
    await advanceDebounce();

    // Clearing the search restores the list rather than opening the form.
    expect(handlers.onCreateTask).not.toHaveBeenCalled();
    expect(rowIds()).toEqual(['a']);
  });

  it('sends the no-tasks action to the create screen', async () => {
    const { handlers } = await mountScreen([]);

    await fireEvent.press(screen.getByTestId('taskList.noTasks.action'));

    expect(handlers.onCreateTask).toHaveBeenCalledTimes(1);
  });

  it('leaves the momentum counts on the whole list while a search narrows the view', async () => {
    await mountScreen([
      taskOf('a', 1, { title: 'Fix Bill', isDone: true }),
      taskOf('b', 2, { title: 'Book the dentist' }),
      taskOf('c', 3, { title: 'Book the vet' }),
    ]);

    expect(screen.getByText(strings.taskList.momentum.progress(1, 3))).toBeTruthy();

    await typeSearch('Book');

    // Two rows on screen, none of them done — and the card still reports one of three.
    expect(rowIds()).toEqual(['c', 'b']);
    expect(screen.getByText(strings.taskList.momentum.progress(1, 3))).toBeTruthy();
    expect(screen.queryByText(strings.taskList.momentum.progress(0, 2))).toBeNull();
  });

  it('narrows the list rather than emptying it when the query does match', async () => {
    await mountScreen([
      taskOf('a', 1, { title: 'Fix Bill' }),
      taskOf('b', 2, { title: 'Book the dentist' }),
    ]);

    await typeSearch('Fix');

    expect(rowIds()).toEqual(['a']);
    expect(screen.queryByTestId('taskList.noResults')).toBeNull();
  });
});

// --- S-4 / AC-5 --------------------------------------------------------------

describe('S-4 — delete asks first, and only a confirmation removes the task (AC-5)', () => {
  const openDeleteDialog = async (): Promise<void> => {
    await fireEvent.press(screen.getByTestId('taskList.row.a.actions'));
    await settle();
    await fireEvent.press(screen.getByRole('menuitem', { name: strings.taskList.row.delete }));
    await settle();
  };

  it('names the task in the modal', async () => {
    await mountScreen([taskOf('a', 1, { title: 'Fix Bill' })], false);

    await openDeleteDialog();

    expect(screen.getByText(strings.taskList.deleteDialog.title)).toBeTruthy();
    expect(screen.getByText(strings.taskList.deleteDialog.message('Fix Bill'))).toBeTruthy();
  });

  it('cancelling removes nothing and queues nothing', async () => {
    const { harness } = await mountScreen([taskOf('a', 1)], false);

    await openDeleteDialog();
    await fireEvent.press(screen.getByTestId('taskList.deleteDialog.cancel'));
    await settle();

    expect(rowIds()).toEqual(['a']);
    expect(screen.queryByText(strings.taskList.deleteDialog.title)).toBeNull();
    expect(readMutationQueue(harness.storage)).toEqual([]);
  });

  it('confirming removes the row and queues the mutation', async () => {
    const { harness } = await mountScreen([taskOf('a', 1), taskOf('b', 2)], false);

    await openDeleteDialog();
    await fireEvent.press(screen.getByTestId('taskList.deleteDialog.confirm'));
    await settle();

    expect(rowIds()).toEqual(['b']);
    expect(screen.queryByText(strings.taskList.deleteDialog.title)).toBeNull();

    const queued = readMutationQueue(harness.storage);
    expect(queued).toHaveLength(1);
    expect(queued[0]).toMatchObject({ kind: 'delete', taskId: 'a' });
  });

  it('opens the task rather than deleting it when Edit is chosen', async () => {
    const { handlers, harness } = await mountScreen([taskOf('a', 1)], false);

    await fireEvent.press(screen.getByTestId('taskList.row.a.actions'));
    await settle();
    await fireEvent.press(screen.getByRole('menuitem', { name: strings.taskList.row.edit }));
    await settle();

    expect(handlers.onOpenTask).toHaveBeenCalledWith('a');
    expect(readMutationQueue(harness.storage)).toEqual([]);
    // The menu closes behind it, so returning does not land on an open menu.
    expect(screen.queryByTestId('taskList.row.a.menu')).toBeNull();
  });

  it('closes an open menu when the same button is pressed again', async () => {
    await mountScreen([taskOf('a', 1)], false);

    await fireEvent.press(screen.getByTestId('taskList.row.a.actions'));
    await settle();
    expect(screen.getByTestId('taskList.row.a.menu')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('taskList.row.a.actions'));
    await settle();
    expect(screen.queryByTestId('taskList.row.a.menu')).toBeNull();
  });

  it('keeps at most one menu open across rows', async () => {
    await mountScreen([taskOf('a', 1), taskOf('b', 2)], false);

    await fireEvent.press(screen.getByTestId('taskList.row.a.actions'));
    await settle();
    await fireEvent.press(screen.getByTestId('taskList.row.b.actions'));
    await settle();

    expect(screen.getByTestId('taskList.row.b.menu')).toBeTruthy();
    expect(screen.queryByTestId('taskList.row.a.menu')).toBeNull();
  });
});

// --- AC-7 --------------------------------------------------------------------

describe('the sync banner reports connectivity and the queue (AC-7, FR-23)', () => {
  it('is absent while the app is online with nothing pending', async () => {
    await mountScreen([taskOf('a', 1)]);

    expect(screen.queryByTestId('taskList.syncBanner')).toBeNull();
  });

  it('announces the outage while the device is offline, in red on a neutral band', async () => {
    await mountScreen([taskOf('a', 1)], false);

    expect(screen.getByTestId('taskList.syncBanner')).toHaveStyle({
      backgroundColor: lightTheme.colors.surface.lowest,
    });
    expect(screen.getByText(strings.syncBanner.offline)).toHaveStyle({
      color: lightTheme.colors.text.error,
    });
  });

  it('lets the scroll indicator reach the screen edge while the rows keep their margin', async () => {
    // iOS draws the scroll indicator against the inside of the scroll view's own frame. Inset
    // that frame and the indicator floats over the rows; so the frame is full-bleed and the
    // 20 pt margin lives on the content it scrolls.
    await mountScreen([taskOf('a', 1)]);

    const frame = StyleSheet.flatten(
      propOf<StyleProp<ViewStyle>>(screen.getByTestId('taskList.scrollFrame'), 'style'),
    );
    const content = StyleSheet.flatten(
      propOf<StyleProp<ViewStyle>>(screen.getByTestId('taskList.list'), 'contentContainerStyle'),
    );

    expect(frame.paddingHorizontal).toBeUndefined();
    expect(content).toMatchObject({ paddingHorizontal: lightTheme.spacing.space20 });
  });

  it('floats over the list rather than pushing it down', async () => {
    // The banner used to sit in the column, so every row moved the moment the radio blinked
    // and moved back when it cleared. What is asserted is the property that stops that: the
    // slot is out of the flow, and the content's own offset does not depend on it.
    const { harness } = await mountScreen([taskOf('a', 1)], false);

    expect(screen.getByTestId('taskList.bannerSlot')).toHaveStyle({ position: 'absolute' });

    await act(async () => {
      harness.connectivity.setIsOnline(true);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.queryByTestId('taskList.syncBanner')).toBeNull();
    });
    expect(screen.getByTestId('taskList.bannerSlot')).toHaveStyle({ position: 'absolute' });
  });

  it('clears once connectivity returns and the queue has drained', async () => {
    const { harness } = await mountScreen([taskOf('a', 1)], false);

    expect(screen.getByTestId('taskList.syncBanner')).toBeTruthy();

    await act(async () => {
      harness.connectivity.setIsOnline(true);
      await Promise.resolve();
    });
    await settle();

    expect(screen.queryByTestId('taskList.syncBanner')).toBeNull();
    expect(screen.queryByText(strings.syncBanner.offline)).toBeNull();
  });
});

// --- The chrome the artboards draw around the list ---------------------------

describe('the screen chrome', () => {
  it('draws the centred To-do title and the floating New task button', async () => {
    const { handlers } = await mountScreen([taskOf('a', 1)]);

    expect(screen.getByRole('header', { name: strings.taskList.title })).toBeTruthy();

    await fireEvent.press(screen.getByTestId('taskList.newTask'));

    expect(handlers.onCreateTask).toHaveBeenCalledTimes(1);
  });

  it('hides the floating button on the no-tasks state, which carries its own call to action', async () => {
    await mountScreen([]);

    expect(screen.queryByTestId('taskList.newTask')).toBeNull();
    expect(screen.getByTestId('taskList.noTasks.action')).toBeTruthy();
  });

  it('draws the pro tip only while there are rows to read it beside', async () => {
    await mountScreen([taskOf('a', 1)]);

    expect(screen.getByText(strings.taskList.proTip.body)).toBeTruthy();
  });

  it('drops it on an empty list', async () => {
    await mountScreen([]);

    expect(screen.queryByText(strings.taskList.proTip.body)).toBeNull();
  });
});
