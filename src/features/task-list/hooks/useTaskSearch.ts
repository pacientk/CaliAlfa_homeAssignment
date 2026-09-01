import type { Task } from '@entities/task';
import { useState } from 'react';

import { filterTasksByTitle } from '../lib/filterTasksByTitle';
import { useDebouncedValue } from './useDebouncedValue';

/** FR-13 states the interval; it is not a tuning knob, so it is not a parameter. */
const SEARCH_DEBOUNCE_MS = 200;

export interface IUseTaskSearchReturn<TTask extends Task> {
  /** What is in the field this instant. The field is controlled, so it never lags the user. */
  readonly query: string;
  readonly setQuery: (next: string) => void;
  readonly clearQuery: () => void;
  /**
   * The query the visible list was actually filtered by. The no-results copy names it rather
   * than `query`, so the sentence and the list it explains can never disagree mid-keystroke.
   */
  readonly settledQuery: string;
  /** The tasks the list should draw, filtered by the settled query. */
  readonly visibleTasks: readonly TTask[];
  /** True once a settled, non-blank query is narrowing the list. Drives the no-results state. */
  readonly isSearchActive: boolean;
  /** How many tasks the settled query is hiding — the number artboard B5 puts in its copy. */
  readonly hiddenCount: number;
}

/**
 * The search field's state and the view it produces.
 *
 * Two values, not one: the field renders `query` so typing is immediate, and the list renders
 * against the debounced copy so a six-character word filters once rather than six times. The
 * empty state keys off the settled value too — otherwise "no match" would flash between
 * keystrokes on a query that does eventually match.
 */
export const useTaskSearch = <TTask extends Task>(
  tasks: readonly TTask[],
): IUseTaskSearchReturn<TTask> => {
  const [query, setQuery] = useState('');
  const settledQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  const visibleTasks = filterTasksByTitle(tasks, settledQuery);

  const clearQuery = (): void => {
    setQuery('');
  };

  return {
    query,
    setQuery,
    clearQuery,
    settledQuery,
    visibleTasks,
    isSearchActive: settledQuery.trim().length > 0,
    hiddenCount: tasks.length - visibleTasks.length,
  };
};
