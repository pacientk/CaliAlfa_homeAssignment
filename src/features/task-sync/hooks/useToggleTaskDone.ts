import type { CachedTask } from '../model/CachedTask';
import { useUpdateTask } from './useUpdateTask';

/**
 * `isDone` is the state the control moved to, not a request to flip the stored value.
 * Two quick taps then queue two writes that agree with what the user saw, where a
 * read-modify-write would queue two flips and land wherever the race left it.
 */
export type ToggleTaskDoneAction = (taskId: string, isDone: boolean) => CachedTask | undefined;

/** Completion, in both directions (FR-8). An update narrowed to the one field. */
export const useToggleTaskDone = (): ToggleTaskDoneAction => {
  const updateTask = useUpdateTask();
  return (taskId: string, isDone: boolean): CachedTask | undefined =>
    updateTask(taskId, { isDone });
};
