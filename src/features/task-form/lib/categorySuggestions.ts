import type { Task } from '@entities/task';

/**
 * The category list is **derived, never stored** (FR-15).
 *
 * There is no category entity, no category endpoint and no category store: a category is a
 * free-text label on a task, so the set of categories that exist is the set of labels the
 * loaded tasks carry. A value the user types is not registered anywhere — it becomes a
 * category the moment its task is saved, and it appears here on the next read for exactly
 * that reason.
 *
 * Empty labels are dropped because the API's shape allows `category: ''`, and an empty chip
 * is not a choice. Sorting is alphabetical so the row is stable across renders rather than
 * reordering itself as the cache does.
 */
export const categorySuggestions = (tasks: readonly Pick<Task, 'category'>[]): string[] => {
  const distinct = new Set<string>();

  for (const task of tasks) {
    if (task.category.length > 0) {
      distinct.add(task.category);
    }
  }

  return [...distinct].sort((left, right) => left.localeCompare(right));
};
