import type { TaskChanges } from '@entities/task/model';

import type { CachedTask } from '../model/CachedTask';
import { useTaskSyncBindings } from '../model/TaskSyncContext';

/** `undefined` when the cache does not hold the task — nothing is queued in that case. */
export type UpdateTaskAction = (taskId: string, changes: TaskChanges) => CachedTask | undefined;

/** Queues an edit and returns the updated task. See {@link useCreateTask} for the shape. */
export const useUpdateTask = (): UpdateTaskAction => {
  const { engine } = useTaskSyncBindings();
  return (taskId: string, changes: TaskChanges): CachedTask | undefined => {
    const updated = engine.enqueueUpdate(taskId, changes);
    void engine.drain();
    return updated;
  };
};
