import type { Task } from '@entities/task';
import { act, renderHook } from '@testing-library/react-native';

import { useTaskSearch } from '../useTaskSearch';

/** FR-13. The test asserts the interval, so a change to it has to be a deliberate one. */
const DEBOUNCE_MS = 200;

const taskOf = (id: string, title: string): Task => ({
  id,
  title,
  description: '',
  category: 'Work',
  isDone: false,
  createdAt: '2026-09-01T12:00:00.000Z',
});

const TASKS: readonly Task[] = [
  taskOf('1', 'Fix Elle Driver'),
  taskOf('2', 'Fix Bill'),
  taskOf('3', 'Book the dentist'),
];

const mountSearch = async (): Promise<{ current: ReturnType<typeof useTaskSearch<Task>> }> => {
  const { result } = await renderHook(() => useTaskSearch(TASKS));
  return result;
};

const advance = async (ms: number): Promise<void> => {
  await act(async () => {
    jest.advanceTimersByTime(ms);
    await Promise.resolve();
  });
};

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useTaskSearch', () => {
  it('shows every task before anything is typed', async () => {
    const result = await mountSearch();

    expect(result.current.visibleTasks).toBe(TASKS);
    expect(result.current.isSearchActive).toBe(false);
    expect(result.current.hiddenCount).toBe(0);
  });

  it('does not filter until the query has settled for 200 ms', async () => {
    const result = await mountSearch();

    await act(async () => {
      result.current.setQuery('Fix');
      await Promise.resolve();
    });

    // The field is up to date immediately…
    expect(result.current.query).toBe('Fix');
    // …but one millisecond short of the interval the list has not moved.
    await advance(DEBOUNCE_MS - 1);
    expect(result.current.visibleTasks).toHaveLength(TASKS.length);

    await advance(1);
    expect(result.current.visibleTasks.map(task => task.id)).toEqual(['1', '2']);
    expect(result.current.settledQuery).toBe('Fix');
  });

  it('filters once for a word typed a letter at a time, not once per letter', async () => {
    const result = await mountSearch();

    for (const next of ['B', 'Bi', 'Bil', 'Bill']) {
      await act(async () => {
        result.current.setQuery(next);
        await Promise.resolve();
      });
      await advance(DEBOUNCE_MS - 1);
    }

    // Nothing has settled yet: every keystroke replaced the pending update.
    expect(result.current.settledQuery).toBe('');

    await advance(DEBOUNCE_MS);
    expect(result.current.settledQuery).toBe('Bill');
    expect(result.current.visibleTasks.map(task => task.id)).toEqual(['2']);
  });

  it('reports how many tasks a settled query is hiding', async () => {
    const result = await mountSearch();

    await act(async () => {
      result.current.setQuery('passport');
      await Promise.resolve();
    });
    await advance(DEBOUNCE_MS);

    expect(result.current.visibleTasks).toEqual([]);
    expect(result.current.isSearchActive).toBe(true);
    expect(result.current.hiddenCount).toBe(TASKS.length);
  });

  it('puts every task back when the query is cleared', async () => {
    const result = await mountSearch();

    await act(async () => {
      result.current.setQuery('passport');
      await Promise.resolve();
    });
    await advance(DEBOUNCE_MS);
    expect(result.current.visibleTasks).toEqual([]);

    await act(async () => {
      result.current.clearQuery();
      await Promise.resolve();
    });
    await advance(DEBOUNCE_MS);

    expect(result.current.query).toBe('');
    expect(result.current.visibleTasks).toBe(TASKS);
    expect(result.current.isSearchActive).toBe(false);
  });

  it('does not treat a query of only spaces as a search', async () => {
    const result = await mountSearch();

    await act(async () => {
      result.current.setQuery('   ');
      await Promise.resolve();
    });
    await advance(DEBOUNCE_MS);

    expect(result.current.isSearchActive).toBe(false);
    expect(result.current.visibleTasks).toBe(TASKS);
  });
});
