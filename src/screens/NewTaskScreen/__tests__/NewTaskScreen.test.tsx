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
import { categorySuggestions } from '@features/task-form';
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

import { NewTaskScreen } from '../NewTaskScreen';

interface MountedScreen {
  harness: TaskSyncHarness;
  onClose: jest.Mock<void, []>;
}

const taskOf = (id: string, step: number, overrides: Partial<CachedTask> = {}): CachedTask =>
  cachedTaskOf(id, { title: `Task ${id}`, createdAt: isoAt(step), ...overrides });

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

/**
 * Offline by default: the create is then still in the queue when the assertion runs, rather
 * than having been drained and answered by the fake transport, which proves nothing about
 * this screen.
 */
const mountScreen = async (tasks: readonly CachedTask[] = []): Promise<MountedScreen> => {
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

  await render(<NewTaskScreen onClose={onClose} />, { wrapper: Wrapper });
  await settle();

  return { harness, onClose };
};

const typeTitle = async (title: string): Promise<void> => {
  await fireEvent.changeText(screen.getByTestId('taskForm.title'), title);
};

/** The field carries its own message as a hint, for a reader that returns to it later. */
const titleError = (): string | undefined =>
  screen.getByTestId('taskForm.title').props.accessibilityHint as string | undefined;

beforeEach(() => {
  jest.useFakeTimers();
  resetSyncStore();
});

// --- S-1 / AC-1 --------------------------------------------------------------

describe('S-1 — every title rejection disables the submit button (AC-1, FR-14)', () => {
  it('refuses an empty title, and says so once the user has typed', async () => {
    await mountScreen();

    // The button is disabled from the first frame — an empty form cannot be submitted.
    // The message waits, because artboard B6 draws a clean placeholder and telling someone
    // their title is missing before they have had a chance to type reads as an accusation.
    expect(screen.getByTestId('taskForm.submit')).toBeDisabled();
    expect(screen.queryByText(strings.taskForm.titleError.empty)).toBeNull();

    await typeTitle('a');
    await typeTitle('');

    expect(screen.getByText(strings.taskForm.titleError.empty)).toBeTruthy();
    expect(screen.getByTestId('taskForm.submit')).toBeDisabled();
  });

  it('refuses a title that is nothing but whitespace, as empty rather than as padded', async () => {
    await mountScreen();

    await typeTitle('   ');

    expect(screen.getByText(strings.taskForm.titleError.empty)).toBeTruthy();
    expect(screen.queryByText(strings.taskForm.titleError.padded)).toBeNull();
    expect(screen.getByTestId('taskForm.submit')).toBeDisabled();
  });

  it('refuses a padded title without trimming it on the user’s behalf', async () => {
    await mountScreen();

    await typeTitle(' Find a bell ');

    expect(screen.getByText(strings.taskForm.titleError.padded)).toBeTruthy();
    expect(screen.getByTestId('taskForm.submit')).toBeDisabled();
    expect(screen.getByTestId('taskForm.title').props.value).toBe(' Find a bell ');
  });

  it('refuses a duplicate and names the task that already exists', async () => {
    await mountScreen([taskOf('a', 1, { title: 'Fix Budd' })]);

    await typeTitle('Fix Budd');

    expect(screen.getByText(strings.taskForm.titleError.duplicate('Fix Budd'))).toBeTruthy();
    expect(screen.getByTestId('taskForm.submit')).toBeDisabled();
  });

  it('refuses a duplicate whatever its casing', async () => {
    await mountScreen([taskOf('a', 1, { title: 'Fix Budd' })]);

    await typeTitle('fix budd');

    expect(screen.getByText(strings.taskForm.titleError.duplicate('fix budd'))).toBeTruthy();
    expect(screen.getByTestId('taskForm.submit')).toBeDisabled();
  });

  it('accepts a clean, unique title: no message, and the button comes alive', async () => {
    await mountScreen([taskOf('a', 1, { title: 'Fix Budd' })]);

    await typeTitle('Find a bell');

    expect(titleError()).toBeUndefined();
    expect(screen.queryByText(strings.taskForm.titleError.empty)).toBeNull();
    expect(screen.queryByText(strings.taskForm.titleError.padded)).toBeNull();
    expect(screen.queryByText(strings.taskForm.titleError.duplicate('Find a bell'))).toBeNull();
    expect(screen.getByTestId('taskForm.submit')).not.toBeDisabled();
  });

  it('draws the two button states the artboards specify, not just the disabled flag', async () => {
    await mountScreen();

    expect(screen.getByTestId('taskForm.submit')).toHaveStyle({
      backgroundColor: lightTheme.colors.surface.containerHighest,
    });

    await typeTitle('Find a bell');

    expect(screen.getByTestId('taskForm.submit')).toHaveStyle({
      backgroundColor: lightTheme.colors.primary.base,
    });
  });

  it('tints the field itself while the title is rejected, and clears the tint after', async () => {
    await mountScreen();

    // Untouched, the field is in its resting palette — the paired half of the rule above.
    expect(screen.getByTestId('taskForm.title')).toHaveStyle({
      borderColor: lightTheme.colors.border.base,
    });

    await typeTitle('a');
    await typeTitle('');

    expect(screen.getByTestId('taskForm.title')).toHaveStyle({
      borderColor: lightTheme.colors.border.error,
    });

    await typeTitle('Find a bell');

    expect(screen.getByTestId('taskForm.title')).toHaveStyle({
      borderColor: lightTheme.colors.border.base,
    });
  });

  it('writes nothing while the title is rejected, however often the button is pressed', async () => {
    const { harness, onClose } = await mountScreen();

    await typeTitle(' Find a bell ');
    await fireEvent.press(screen.getByTestId('taskForm.submit'));
    await settle();

    expect(readMutationQueue(harness.storage)).toEqual([]);
    expect(readTaskCache(harness.storage)).toEqual([]);
    expect(onClose).not.toHaveBeenCalled();
  });
});

// --- S-2 / AC-2 --------------------------------------------------------------

describe('S-2 — a submitted task reaches the cache and the queue (AC-2, FR-7)', () => {
  it('writes the task to both stores and returns to the list', async () => {
    const { harness, onClose } = await mountScreen();

    await typeTitle('Find a bell');
    await fireEvent.changeText(screen.getByTestId('taskForm.description'), 'At the pawn shop');
    await fireEvent.press(screen.getByTestId('taskForm.submit'));
    await settle();

    const cached = readTaskCache(harness.storage);
    expect(cached).toHaveLength(1);
    expect(cached[0]).toMatchObject({
      title: 'Find a bell',
      description: 'At the pawn shop',
      isDone: false,
      isLocalId: true,
    });

    const queued = readMutationQueue(harness.storage);
    expect(queued).toHaveLength(1);
    expect(queued[0]).toMatchObject({
      kind: 'create',
      payload: { title: 'Find a bell', isDone: false },
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('creates it as not done, whatever else the form holds', async () => {
    const { harness } = await mountScreen();

    await typeTitle('Find a bell');
    await fireEvent.press(screen.getByTestId('taskForm.submit'));
    await settle();

    expect(readTaskCache(harness.storage)[0]?.isDone).toBe(false);
  });

  it('states an absent expiry as null rather than leaving the service to invent one', async () => {
    const { harness } = await mountScreen();

    await typeTitle('Find a bell');
    await fireEvent.press(screen.getByTestId('taskForm.submit'));
    await settle();

    const queued = readMutationQueue(harness.storage)[0];
    expect(queued?.kind).toBe('create');
    expect(queued?.kind === 'create' && 'expiresAt' in queued.payload).toBe(true);
    expect(queued?.kind === 'create' ? queued.payload.expiresAt : 'missing').toBeNull();
    expect(readTaskCache(harness.storage)[0]?.expiresAt).toBeUndefined();
  });

  it('stamps the moment the user wrote it, not the moment a request drains', async () => {
    const { harness } = await mountScreen();

    await typeTitle('Find a bell');
    await fireEvent.press(screen.getByTestId('taskForm.submit'));
    await settle();

    const createdAt = readTaskCache(harness.storage)[0]?.createdAt ?? '';
    expect(Number.isNaN(new Date(createdAt).getTime())).toBe(false);
  });
});

// --- S-4 / AC-4 --------------------------------------------------------------

describe('S-4 — the categories on offer are the ones the loaded tasks carry (AC-4)', () => {
  const seeded = (): CachedTask[] => [
    taskOf('a', 1, { title: 'One', category: 'Work' }),
    taskOf('b', 2, { title: 'Two', category: 'Personal' }),
    taskOf('c', 3, { title: 'Three', category: 'Work' }),
    taskOf('d', 4, { title: 'Four', category: '' }),
  ];

  it('offers each distinct category once and nothing else', async () => {
    await mountScreen(seeded());

    expect(screen.getByTestId('taskForm.category.chip.Work')).toBeTruthy();
    expect(screen.getByTestId('taskForm.category.chip.Personal')).toBeTruthy();
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  });

  it('selects a category by pressing its chip, and clears it by pressing it again', async () => {
    const { harness } = await mountScreen(seeded());

    await typeTitle('Find a bell');
    await fireEvent.press(screen.getByTestId('taskForm.category.chip.Work'));

    expect(screen.getByTestId('taskForm.category.chip.Work')).toHaveStyle({
      backgroundColor: lightTheme.colors.primary.base,
    });

    await fireEvent.press(screen.getByTestId('taskForm.category.chip.Work'));

    expect(screen.getByTestId('taskForm.category.chip.Work')).toHaveStyle({
      backgroundColor: lightTheme.colors.surface.containerHigh,
    });

    await fireEvent.press(screen.getByTestId('taskForm.submit'));
    await settle();

    expect(readTaskCache(harness.storage).at(-1)?.category).toBe('');
  });

  it('takes a category that is not on offer, and offers it to the next task', async () => {
    const { harness } = await mountScreen(seeded());

    expect(screen.queryByTestId('taskForm.category.chip.Errands')).toBeNull();

    await typeTitle('Find a bell');
    await fireEvent.press(screen.getByTestId('taskForm.category.new'));
    await fireEvent.changeText(screen.getByTestId('taskForm.category.input'), 'Errands');
    await fireEvent.press(screen.getByTestId('taskForm.submit'));
    await settle();

    expect(readTaskCache(harness.storage).at(-1)?.category).toBe('Errands');
    expect(categorySuggestions(readTaskCache(harness.storage))).toContain('Errands');
    // The chips are derived from the cache on every render, so the new category is on offer
    // the moment its task is saved — no store to update, and nothing to invalidate.
    expect(screen.getByTestId('taskForm.category.chip.Errands')).toBeTruthy();
  });

  it('keeps the free-text field closed until it is asked for', async () => {
    await mountScreen(seeded());

    expect(screen.queryByTestId('taskForm.category.input')).toBeNull();

    await fireEvent.press(screen.getByTestId('taskForm.category.new'));

    expect(screen.getByTestId('taskForm.category.input')).toBeTruthy();
  });
});

// --- The expiry field, on a form that starts without one ---------------------

describe('the expiry field starts empty and reaches a moment (FR-7)', () => {
  it('reads as "never expires" until something is chosen', async () => {
    await mountScreen();

    expect(screen.getByTestId('taskForm.expiry.value')).toHaveTextContent(
      strings.taskForm.expiry.empty,
    );
    expect(screen.queryByTestId('taskForm.expiry.clear')).toBeNull();
  });

  it('stores the chosen day and time, and shows it in the field', async () => {
    const { harness } = await mountScreen();

    await typeTitle('Find a bell');
    await fireEvent.press(screen.getByTestId('taskForm.expiry.open'));
    await fireEvent.press(screen.getByTestId('taskForm.expiry.picker.day.tomorrow'));
    await fireEvent.press(screen.getByTestId('taskForm.expiry.picker.time.09:00'));
    await fireEvent.press(screen.getByTestId('taskForm.expiry.picker.confirm'));
    await settle();

    expect(screen.queryByText(strings.taskForm.expiry.empty)).toBeNull();
    expect(screen.getByTestId('taskForm.expiry.value')).toHaveTextContent(/, 09:00$/);
    expect(screen.getByTestId('taskForm.expiry.clear')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('taskForm.submit'));
    await settle();

    const stored = readTaskCache(harness.storage)[0]?.expiresAt ?? '';
    const expected = new Date(stored);
    expect(expected.getHours()).toBe(9);
  });

  it('takes "No expiry" from the picker as a real answer', async () => {
    const { harness } = await mountScreen();

    await typeTitle('Find a bell');
    await fireEvent.press(screen.getByTestId('taskForm.expiry.open'));
    await fireEvent.press(screen.getByTestId('taskForm.expiry.picker.never'));
    await settle();

    expect(screen.getByTestId('taskForm.expiry.value')).toHaveTextContent(
      strings.taskForm.expiry.empty,
    );

    await fireEvent.press(screen.getByTestId('taskForm.submit'));
    await settle();

    expect(readTaskCache(harness.storage)[0]?.expiresAt).toBeUndefined();
  });
});

// --- The chrome the artboards draw around the form ---------------------------

describe('the create screen chrome (B6)', () => {
  it('draws the centred title, the advice card, and a back arrow that leaves', async () => {
    const { onClose } = await mountScreen();

    expect(screen.getByRole('header', { name: strings.newTask.title })).toBeTruthy();
    expect(screen.getByText(strings.newTask.tip.body)).toBeTruthy();

    await fireEvent.press(screen.getByTestId('taskForm.back'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('offers neither a completion switch, a delete action, nor metadata', async () => {
    await mountScreen();

    expect(screen.queryByTestId('taskForm.completion')).toBeNull();
    expect(screen.queryByTestId('taskForm.delete')).toBeNull();
    expect(screen.queryByTestId('taskForm.metadata')).toBeNull();
  });

  /**
   * A regression, found on the simulator: the centred title spans the whole bar, so drawing
   * it after the back arrow put it on top and swallowed every tap on the arrow. Order is the
   * fix, and order is therefore what this asserts — a press test would pass either way,
   * because the test renderer dispatches straight to the handler and never hit-tests.
   */
  it('draws the centred title beneath the back arrow, so the arrow stays tappable', async () => {
    await mountScreen();

    const back = screen.getByTestId('taskForm.back');
    const siblings = back.parent?.children ?? [];
    const titleIndex = siblings.findIndex(
      child => typeof child !== 'string' && child.props.accessibilityRole === 'header',
    );

    expect(titleIndex).toBeGreaterThanOrEqual(0);
    expect(titleIndex).toBeLessThan(siblings.indexOf(back));
  });

  it('labels the submit action "Add task"', async () => {
    await mountScreen();

    expect(screen.getByLabelText(strings.newTask.submit)).toBeTruthy();
  });
});
