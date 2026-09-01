import type { CachedTask } from '../model/CachedTask';
import { useTasks } from './useTasks';

/**
 * One task from the cache.
 *
 * Derived from the list rather than fetched per id: after the first sync the full set is
 * local (FR-24), so a detail screen has nothing to wait for, and a task created offline
 * has no server record to read anyway.
 */
export const useTask = (taskId: string): CachedTask | undefined => {
  const tasks = useTasks();
  return tasks.find(task => task.id === taskId);
};
