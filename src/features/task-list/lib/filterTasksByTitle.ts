import type { Task } from '@entities/task';

/**
 * FR-13: search filters by title, on the client. The whole set is already local after the
 * first sync (FR-24), so there is nothing to ask the server for.
 *
 * Matching is a case-insensitive substring on a trimmed needle — the query is what the user
 * is typing, and a trailing space they have not finished typing should not empty the list.
 * The haystack is deliberately *not* trimmed: a stored title keeps whatever the server holds.
 *
 * Returns the input array unchanged when there is nothing to filter by, rather than a copy:
 * a fresh array identity on every keystroke is a re-render the recycling list does not need.
 */
export const filterTasksByTitle = <TTask extends Task>(
  tasks: readonly TTask[],
  query: string,
): readonly TTask[] => {
  const needle = query.trim().toLowerCase();

  if (needle.length === 0) {
    return tasks;
  }

  return tasks.filter(task => task.title.toLowerCase().includes(needle));
};
