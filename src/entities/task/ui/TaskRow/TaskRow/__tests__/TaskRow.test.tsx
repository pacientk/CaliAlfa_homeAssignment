import type { Task } from '@entities/task/model';
import { strings } from '@lib/strings';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { lightTheme } from '@ui/tokens';
import { ThemeProvider } from '@ui/tokens';
import type { ReactElement } from 'react';

import { TaskRow } from '../TaskRow';

const ROW_ID = 'row';

const TEST_IDS = {
  card: `${ROW_ID}.card`,
  title: `${ROW_ID}.title`,
  chip: `${ROW_ID}.chip`,
  checkbox: `${ROW_ID}.checkbox`,
  actions: `${ROW_ID}.actions`,
  menu: `${ROW_ID}.menu`,
} as const;

const taskOf = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  title: 'Fix Elle Driver',
  description: '',
  category: 'In Progress',
  isDone: false,
  createdAt: '2026-09-01T12:00:00.000Z',
  ...overrides,
});

interface RowHandlers {
  onToggleDone: jest.Mock<void, [boolean]>;
  onToggleMenu: jest.Mock<void, []>;
  onEdit: jest.Mock<void, []>;
  onDelete: jest.Mock<void, []>;
}

const handlersOf = (): RowHandlers => ({
  onToggleDone: jest.fn<void, [boolean]>(),
  onToggleMenu: jest.fn<void, []>(),
  onEdit: jest.fn<void, []>(),
  onDelete: jest.fn<void, []>(),
});

interface RowOptions {
  task?: Task;
  isExpired?: boolean;
  isMenuOpen?: boolean;
  handlers?: RowHandlers;
}

const renderRow = async (options: RowOptions = {}): Promise<RowHandlers> => {
  const handlers = options.handlers ?? handlersOf();

  const element: ReactElement = (
    <TaskRow
      task={options.task ?? taskOf()}
      isExpired={options.isExpired ?? false}
      isMenuOpen={options.isMenuOpen ?? false}
      onToggleDone={handlers.onToggleDone}
      onToggleMenu={handlers.onToggleMenu}
      onEdit={handlers.onEdit}
      onDelete={handlers.onDelete}
      testID={ROW_ID}
    />
  );

  await render(element, { wrapper: ThemeProvider });

  return handlers;
};

const { colors, shadows, sizes, borderRadius } = lightTheme;

// --- S-1 / AC-1 / AC-3 -------------------------------------------------------

describe('S-1 — the five row states each render their own treatment (AC-1, AC-3)', () => {
  it('default: a white card with the level-1 shadow, an outline-variant box, primary title', async () => {
    await renderRow();

    expect(screen.getByTestId(TEST_IDS.card)).toHaveStyle({
      backgroundColor: colors.surface.lowest,
      borderColor: colors.surface.lowest,
      shadowColor: shadows.level1.shadowColor,
      shadowOpacity: shadows.level1.shadowOpacity,
      minHeight: sizes.size56,
      borderRadius: borderRadius.radius16,
    });
    expect(screen.getByTestId(TEST_IDS.checkbox)).toHaveStyle({
      backgroundColor: colors.surface.lowest,
      borderColor: colors.border.base,
    });
    expect(screen.getByTestId(TEST_IDS.title)).toHaveStyle({ color: colors.text.primary });
    expect(screen.getByTestId(TEST_IDS.title)).not.toHaveStyle({
      textDecorationLine: 'line-through',
    });
    expect(screen.getByTestId(TEST_IDS.chip)).toHaveStyle({
      backgroundColor: colors.surface.containerHigh,
    });
  });

  it('completed: a success fill with a white check, and a struck-through secondary title', async () => {
    await renderRow({ task: taskOf({ isDone: true }) });

    expect(screen.getByTestId(TEST_IDS.checkbox)).toHaveStyle({
      backgroundColor: colors.feedback.success,
      borderColor: colors.feedback.success,
    });
    expect(screen.getByText('check')).toHaveStyle({ color: colors.text.onPrimary });
    expect(screen.getByTestId(TEST_IDS.title)).toHaveStyle({
      color: colors.text.secondary,
      textDecorationLine: 'line-through',
    });
    // The card and the chip do not move with completion — only the row's contents do.
    expect(screen.getByTestId(TEST_IDS.card)).toHaveStyle({
      backgroundColor: colors.surface.lowest,
    });
    expect(screen.getByTestId(TEST_IDS.chip)).toHaveStyle({
      backgroundColor: colors.surface.containerHigh,
    });
  });

  it('expired: a container fill with a hairline edge and no shadow, a disabled box, a tertiary title', async () => {
    await renderRow({ isExpired: true });

    const card = screen.getByTestId(TEST_IDS.card);

    expect(card).toHaveStyle({
      backgroundColor: colors.surface.container,
      borderColor: colors.border.muted,
    });
    expect(card).not.toHaveStyle({ shadowOpacity: shadows.level1.shadowOpacity });
    expect(screen.getByTestId(TEST_IDS.checkbox)).toHaveStyle({
      backgroundColor: colors.surface.containerHighest,
      borderColor: colors.border.dim,
    });
    expect(screen.getByTestId(TEST_IDS.title)).toHaveStyle({ color: colors.text.tertiary });
    expect(screen.getByTestId(TEST_IDS.chip)).toHaveStyle({
      backgroundColor: colors.surface.containerHighest,
    });
  });

  it('expired and completed: the completed treatment survives the deadline (AC-3)', async () => {
    await renderRow({ task: taskOf({ isDone: true }), isExpired: true });

    // The card recesses, because the task is expired…
    expect(screen.getByTestId(TEST_IDS.card)).toHaveStyle({
      backgroundColor: colors.surface.container,
    });
    expect(screen.getByTestId(TEST_IDS.chip)).toHaveStyle({
      backgroundColor: colors.surface.containerHighest,
    });
    // …but the box keeps its success fill and the title its strike-through.
    expect(screen.getByTestId(TEST_IDS.checkbox)).toHaveStyle({
      backgroundColor: colors.feedback.success,
    });
    expect(screen.getByTestId(TEST_IDS.checkbox)).not.toHaveStyle({
      backgroundColor: colors.surface.containerHighest,
    });
    expect(screen.getByTestId(TEST_IDS.title)).toHaveStyle({
      color: colors.text.secondary,
      textDecorationLine: 'line-through',
    });
  });

  it('menu open: a 2 pt brand outline over whichever fill the underlying state chose', async () => {
    await renderRow({ isMenuOpen: true });

    expect(screen.getByTestId(TEST_IDS.card)).toHaveStyle({
      borderWidth: 2,
      borderColor: colors.primary.base,
      backgroundColor: colors.surface.lowest,
    });
    expect(screen.getByTestId(TEST_IDS.actions)).toHaveStyle({
      backgroundColor: colors.primary.fixed,
    });
    expect(screen.getByTestId(TEST_IDS.menu)).toBeTruthy();
  });

  it('menu open on an expired row: the outline is added, the recessed fill is kept', async () => {
    await renderRow({ isExpired: true, isMenuOpen: true });

    expect(screen.getByTestId(TEST_IDS.card)).toHaveStyle({
      borderWidth: 2,
      borderColor: colors.primary.base,
      backgroundColor: colors.surface.container,
    });
  });

  it('draws no chip for a task with no category', async () => {
    await renderRow({ task: taskOf({ category: '' }) });

    expect(screen.queryByTestId(TEST_IDS.chip)).toBeNull();
  });
});

// --- S-2 / AC-2 --------------------------------------------------------------

describe('S-2 — an expired row disables its checkbox and keeps its menu (AC-2)', () => {
  it('does not report a toggle when the expired checkbox is pressed', async () => {
    const handlers = await renderRow({ isExpired: true });

    await fireEvent.press(screen.getByTestId(TEST_IDS.checkbox));

    expect(handlers.onToggleDone).not.toHaveBeenCalled();
    expect(screen.getByTestId(TEST_IDS.checkbox)).toBeDisabled();
  });

  it('opens the menu from the same expired row, because the three-dot button stays active', async () => {
    const handlers = await renderRow({ isExpired: true });

    await fireEvent.press(screen.getByTestId(TEST_IDS.actions));

    expect(handlers.onToggleMenu).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId(TEST_IDS.actions)).not.toBeDisabled();
  });

  it('reports the value the checkbox moved to, not a request to flip the stored one', async () => {
    const handlers = await renderRow();

    await fireEvent.press(screen.getByTestId(TEST_IDS.checkbox));

    expect(handlers.onToggleDone).toHaveBeenCalledWith(true);
  });

  it('reports false when a completed task is unticked, so completion toggles both ways', async () => {
    const handlers = await renderRow({ task: taskOf({ isDone: true }) });

    await fireEvent.press(screen.getByTestId(TEST_IDS.checkbox));

    expect(handlers.onToggleDone).toHaveBeenCalledWith(false);
  });
});

// --- FR-9 --------------------------------------------------------------------

describe('the row action menu', () => {
  it('is absent until the row is told its menu is open', async () => {
    await renderRow();

    expect(screen.queryByTestId(TEST_IDS.menu)).toBeNull();
    expect(screen.queryByText(strings.taskList.row.edit)).toBeNull();
    expect(screen.queryByText(strings.taskList.row.delete)).toBeNull();
  });

  it('offers Edit and Delete, and reports which one was chosen', async () => {
    const handlers = await renderRow({ isMenuOpen: true });

    await fireEvent.press(screen.getByRole('menuitem', { name: strings.taskList.row.edit }));
    expect(handlers.onEdit).toHaveBeenCalledTimes(1);
    expect(handlers.onDelete).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('menuitem', { name: strings.taskList.row.delete }));
    expect(handlers.onDelete).toHaveBeenCalledTimes(1);
    expect(handlers.onEdit).toHaveBeenCalledTimes(1);
  });

  it('announces the task each control belongs to', async () => {
    await renderRow({ isMenuOpen: true });

    expect(
      screen.getByRole('checkbox', { name: strings.taskList.row.toggleDone('Fix Elle Driver') }),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: strings.taskList.row.actions('Fix Elle Driver') }),
    ).toBeTruthy();
  });
});
