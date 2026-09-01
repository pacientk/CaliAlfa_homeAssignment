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
import { isTaskExpired } from '@entities/task';
import { formatTimestamp } from '@features/task-form';
import type { CachedTask } from '@features/task-sync';
import { readMutationQueue, readTaskCache, writeTaskCache } from '@features/task-sync';
import { cachedTaskOf, isoAt } from '@features/task-sync/testing/taskSyncFixtures';
import type { TaskSyncHarness } from '@features/task-sync/testing/taskSyncHarness';
import { resetSyncStore, setupTaskSync } from '@features/task-sync/testing/taskSyncHarness';
import { strings } from '@lib/strings';
import { createMemoryStorage } from '@shared/services/storage';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { lightTheme, ThemeProvider } from '@ui/tokens';
import type { JSX, ReactNode } from 'react';
import type * as SafeAreaContext from 'react-native-safe-area-context';

import { TaskDetailScreen } from '../TaskDetailScreen';

const PAST_EXPIRY = '2020-01-01T00:00:00.000Z';
const NOW = '2026-09-01T12:00:00.000Z';

interface MountedScreen {
  harness: TaskSyncHarness;
  onClose: jest.Mock<void, []>;
}

const taskOf = (id: string, overrides: Partial<CachedTask> = {}): CachedTask =>
  cachedTaskOf(id, {
    title: `Task ${id}`,
    description: 'Call back about the swordsmith invoice.',
    category: 'In Progress',
    createdAt: isoAt(1),
    ...overrides,
  });

const toServerTask = (task: CachedTask): Task => ({
  id: task.id,
  title: task.title,
  description: task.description,
  category: task.category,
  isDone: task.isDone,
  createdAt: task.createdAt,
  ...(task.expiresAt === undefined ? {} : { expiresAt: task.expiresAt }),
});

const settle = async (): Promise<void> => {
  await act(async () => {
    jest.runOnlyPendingTimers();
    await Promise.resolve();
  });
};

/** Offline, so an accepted write is still in the queue when the assertion reads it back. */
const mountScreen = async (
  tasks: readonly CachedTask[],
  taskId: string,
): Promise<MountedScreen> => {
  const storage = createMemoryStorage();
  writeTaskCache(storage, [...tasks]);
  const harness = setupTaskSync({ storage, isInitiallyOnline: false });
  harness.pageSource.script(tasks.map(toServerTask));

  const onClose = jest.fn<void, []>();

  const Wrapper = ({ children }: { children: ReactNode }): JSX.Element => (
    <harness.Wrapper>
      <ThemeProvider>{children}</ThemeProvider>
    </harness.Wrapper>
  );

  await render(<TaskDetailScreen taskId={taskId} onClose={onClose} />, { wrapper: Wrapper });
  await settle();

  return { harness, onClose };
};

const save = async (): Promise<void> => {
  await fireEvent.press(screen.getByTestId('taskForm.submit'));
  await settle();
};

beforeEach(() => {
  jest.useFakeTimers();
  resetSyncStore();
});

// --- S-3 / AC-3 --------------------------------------------------------------

describe('S-3 — the form opens prefilled from the task (AC-3, FR-11)', () => {
  it('fills every field from the record', async () => {
    await mountScreen(
      [
        taskOf('a', {
          title: 'Fix Elle Driver',
          description: 'Call back before Friday.',
          category: 'Work',
          expiresAt: '2026-03-18T18:00:00.000Z',
        }),
      ],
      'a',
    );

    expect(screen.getByTestId('taskForm.title').props.value).toBe('Fix Elle Driver');
    expect(screen.getByTestId('taskForm.description').props.value).toBe('Call back before Friday.');
    expect(screen.getByTestId('taskForm.category.chip.Work')).toHaveStyle({
      backgroundColor: lightTheme.colors.primary.base,
    });
    expect(screen.getByTestId('taskForm.expiry.value')).toHaveTextContent(
      formatTimestamp('2026-03-18T18:00:00.000Z'),
    );
  });

  it('renders an absent expiry as empty rather than as a default date', async () => {
    await mountScreen([taskOf('a')], 'a');

    expect(screen.getByTestId('taskForm.expiry.value')).toHaveTextContent(
      strings.taskForm.expiry.empty,
    );
    expect(screen.queryByTestId('taskForm.expiry.clear')).toBeNull();
    expect(screen.queryByText(strings.taskDetail.expiresLabel)).toBeNull();
  });

  it('shows the created moment, and the expiry beside it when there is one', async () => {
    await mountScreen([taskOf('a', { expiresAt: '2026-03-18T18:00:00.000Z' })], 'a');

    expect(screen.getByText(strings.taskDetail.createdLabel)).toBeTruthy();
    expect(screen.getByText(formatTimestamp(isoAt(1)))).toBeTruthy();
    expect(screen.getByText(strings.taskDetail.expiresLabel)).toBeTruthy();
  });

  it('keeps its own title out of the duplicate rule, so saving it untouched is allowed', async () => {
    const { harness } = await mountScreen(
      [taskOf('a', { title: 'Gloves' }), taskOf('b', { title: 'Other' })],
      'a',
    );

    expect(screen.queryByText(strings.taskForm.titleError.duplicate('Gloves'))).toBeNull();
    expect(screen.getByTestId('taskForm.submit')).not.toBeDisabled();

    await save();

    expect(readMutationQueue(harness.storage)).toMatchObject([
      { kind: 'update', taskId: 'a', payload: { title: 'Gloves' } },
    ]);
  });

  it('still refuses a title that duplicates a different task', async () => {
    const { harness } = await mountScreen(
      [taskOf('a', { title: 'Gloves' }), taskOf('b', { title: 'Boots' })],
      'a',
    );

    await fireEvent.changeText(screen.getByTestId('taskForm.title'), 'Boots');

    expect(screen.getByText(strings.taskForm.titleError.duplicate('Boots'))).toBeTruthy();
    expect(screen.getByTestId('taskForm.submit')).toBeDisabled();

    await save();

    expect(readMutationQueue(harness.storage)).toEqual([]);
  });
});

// --- Editing, and what reaches the two stores --------------------------------

describe('an edit reaches the cache and the queue (AC-2, FR-11)', () => {
  it('writes every changed field, read back from storage', async () => {
    const { harness, onClose } = await mountScreen([taskOf('a', { title: 'Gloves' })], 'a');

    await fireEvent.changeText(screen.getByTestId('taskForm.title'), 'Gloves and hat');
    await fireEvent.changeText(screen.getByTestId('taskForm.description'), 'Both of them');
    await save();

    expect(readTaskCache(harness.storage)).toMatchObject([
      { id: 'a', title: 'Gloves and hat', description: 'Both of them' },
    ]);
    expect(readMutationQueue(harness.storage)).toMatchObject([
      {
        kind: 'update',
        taskId: 'a',
        payload: { title: 'Gloves and hat', description: 'Both of them' },
      },
    ]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('carries completion through the same save rather than writing it on the toggle', async () => {
    const { harness } = await mountScreen([taskOf('a')], 'a');

    await fireEvent.press(screen.getByTestId('taskForm.completion'));

    expect(screen.getByTestId('taskForm.completion')).toBeChecked();
    // Nothing is written until the form is saved: one press, one queued mutation.
    expect(readMutationQueue(harness.storage)).toEqual([]);

    await save();

    expect(readTaskCache(harness.storage)[0]?.isDone).toBe(true);
    expect(readMutationQueue(harness.storage)).toMatchObject([
      { kind: 'update', taskId: 'a', payload: { isDone: true } },
    ]);
  });

  it('toggles completion in both directions', async () => {
    const { harness } = await mountScreen([taskOf('a', { isDone: true })], 'a');

    expect(screen.getByTestId('taskForm.completion')).toBeChecked();

    await fireEvent.press(screen.getByTestId('taskForm.completion'));

    expect(screen.getByTestId('taskForm.completion')).not.toBeChecked();

    await save();

    expect(readTaskCache(harness.storage)[0]?.isDone).toBe(false);
  });

  it('leaves the record alone when the form is abandoned', async () => {
    const { harness, onClose } = await mountScreen([taskOf('a', { title: 'Gloves' })], 'a');

    await fireEvent.changeText(screen.getByTestId('taskForm.title'), 'Something else');
    await fireEvent.press(screen.getByTestId('taskForm.back'));
    await settle();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(readTaskCache(harness.storage)[0]?.title).toBe('Gloves');
    expect(readMutationQueue(harness.storage)).toEqual([]);
  });
});

// --- S-5 / AC-5 --------------------------------------------------------------

describe('S-5 — clearing an expiry stores no expiry at all (AC-5)', () => {
  it('sends null and leaves a record that is not expired', async () => {
    const { harness } = await mountScreen([taskOf('a', { expiresAt: PAST_EXPIRY })], 'a');

    expect(isTaskExpired(readTaskCache(harness.storage)[0] ?? { expiresAt: undefined }, NOW)).toBe(
      true,
    );

    await fireEvent.press(screen.getByTestId('taskForm.expiry.clear'));

    expect(screen.getByTestId('taskForm.expiry.value')).toHaveTextContent(
      strings.taskForm.expiry.empty,
    );

    await save();

    const stored = readTaskCache(harness.storage)[0];
    expect(stored).toBeDefined();
    expect(stored === undefined ? 'missing' : 'expiresAt' in stored).toBe(false);
    expect(isTaskExpired(stored ?? { expiresAt: undefined }, NOW)).toBe(false);

    const queued = readMutationQueue(harness.storage)[0];
    expect(queued?.kind).toBe('update');
    expect(queued?.kind === 'update' ? queued.payload.expiresAt : 'missing').toBeNull();
  });

  it('replaces an expiry rather than clearing it when a new moment is chosen', async () => {
    const { harness } = await mountScreen([taskOf('a', { expiresAt: PAST_EXPIRY })], 'a');

    await fireEvent.press(screen.getByTestId('taskForm.expiry.open'));
    await fireEvent.press(screen.getByTestId('taskForm.expiry.picker.day.inAWeek'));
    await fireEvent.press(screen.getByTestId('taskForm.expiry.picker.confirm'));
    await save();

    const stored = readTaskCache(harness.storage)[0];
    expect(stored?.expiresAt).toBeDefined();
    expect(stored?.expiresAt).not.toBe(PAST_EXPIRY);
    expect(isTaskExpired(stored ?? { expiresAt: undefined }, NOW)).toBe(false);
  });

  it('keeps the stored expiry when the picker is dismissed without an answer', async () => {
    const { harness } = await mountScreen([taskOf('a', { expiresAt: PAST_EXPIRY })], 'a');

    await fireEvent.press(screen.getByTestId('taskForm.expiry.open'));
    await fireEvent.press(screen.getByTestId('taskForm.expiry.picker.day.tomorrow'));
    await fireEvent(screen.getByTestId('taskForm.expiry.picker'), 'requestClose');
    await save();

    expect(readTaskCache(harness.storage)[0]?.expiresAt).toBe(PAST_EXPIRY);
  });
});

// --- S-6 / AC-6 --------------------------------------------------------------

describe('AC-6 — Delete asks first, and a confirmation removes the task', () => {
  const openDeleteDialog = async (): Promise<void> => {
    await fireEvent.press(screen.getByTestId('taskForm.delete'));
    await settle();
  };

  it('names the task in the modal', async () => {
    await mountScreen([taskOf('a', { title: 'Fix Bill' })], 'a');

    await openDeleteDialog();

    expect(screen.getByText(strings.taskList.deleteDialog.message('Fix Bill'))).toBeTruthy();
  });

  it('cancelling removes nothing and stays on the screen', async () => {
    const { harness, onClose } = await mountScreen([taskOf('a')], 'a');

    await openDeleteDialog();
    await fireEvent.press(screen.getByTestId('taskList.deleteDialog.cancel'));
    await settle();

    expect(readTaskCache(harness.storage)).toHaveLength(1);
    expect(readMutationQueue(harness.storage)).toEqual([]);
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByTestId('taskForm.submit')).toBeTruthy();
  });

  it('confirming removes the task, queues the delete, and returns to the list', async () => {
    const { harness, onClose } = await mountScreen([taskOf('a'), taskOf('b')], 'a');

    await openDeleteDialog();
    await fireEvent.press(screen.getByTestId('taskList.deleteDialog.confirm'));
    await settle();

    expect(readTaskCache(harness.storage).map(task => task.id)).toEqual(['b']);
    expect(readMutationQueue(harness.storage)).toMatchObject([{ kind: 'delete', taskId: 'a' }]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders an empty screen rather than crashing once the task is gone', async () => {
    await mountScreen([taskOf('a')], 'a');

    await openDeleteDialog();
    await fireEvent.press(screen.getByTestId('taskList.deleteDialog.confirm'));
    await settle();

    expect(screen.getByTestId('taskDetail.missing')).toBeTruthy();
    expect(screen.queryByTestId('taskForm.submit')).toBeNull();
  });

  it('renders the empty screen for a task the cache does not hold', async () => {
    await mountScreen([taskOf('a')], 'nobody');

    expect(screen.getByTestId('taskDetail.missing')).toBeTruthy();
  });
});

// --- The chrome artboard B8 draws around the form ----------------------------

describe('the edit screen chrome (B8)', () => {
  it('draws the edit title, the completion switch, the metadata and the delete action', async () => {
    await mountScreen([taskOf('a')], 'a');

    expect(screen.getByRole('header', { name: strings.taskDetail.title })).toBeTruthy();
    expect(screen.getByTestId('taskForm.completion')).toBeTruthy();
    expect(screen.getByTestId('taskForm.metadata')).toBeTruthy();
    expect(screen.getByTestId('taskForm.delete')).toBeTruthy();
    expect(screen.getByLabelText(strings.taskDetail.submit)).toBeTruthy();
  });

  it('does not draw the create screen’s advice card', async () => {
    await mountScreen([taskOf('a')], 'a');

    expect(screen.queryByText(strings.newTask.tip.body)).toBeNull();
  });
});
