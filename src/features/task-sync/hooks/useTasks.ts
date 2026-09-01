import { useQuery } from '@tanstack/react-query';

import type { CachedTask } from '../model/CachedTask';
import { taskQueryKeys } from '../model/taskQueryKeys';
import { useTaskSyncBindings } from '../model/TaskSyncContext';

/**
 * Newest first (FR-6), by the client-supplied `createdAt`. ISO-8601 strings compare
 * chronologically, so no date is parsed to sort a list.
 *
 * Ordering lives here rather than in the list screen because it is a requirement about
 * the data, and because a second screen sorting it again is how two orders appear.
 */
const byNewestFirst = (left: CachedTask, right: CachedTask): number => {
  if (left.createdAt === right.createdAt) {
    return 0;
  }
  return left.createdAt < right.createdAt ? 1 : -1;
};

const sortNewestFirst = (tasks: CachedTask[]): CachedTask[] => [...tasks].sort(byNewestFirst);

/**
 * The whole cached list, newest first.
 *
 * The query never reaches the network: its data is written by the engine's subscription,
 * and the one fetch this app makes is the first sync the provider runs. Reading through
 * `useQuery` rather than the engine directly is what gives every screen the same cache
 * and one re-render per change.
 */
export const useTasks = (): CachedTask[] => {
  const { engine } = useTaskSyncBindings();
  const { data } = useQuery({
    queryKey: taskQueryKeys.list,
    queryFn: (): CachedTask[] => engine.getSnapshot().tasks,
    select: sortNewestFirst,
  });
  return data ?? [];
};
