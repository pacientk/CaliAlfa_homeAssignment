import { useTaskSyncBindings } from '../model/TaskSyncContext';

export type DeleteTaskAction = (taskId: string) => void;

/** Queues a delete. The task leaves the cache immediately. */
export const useDeleteTask = (): DeleteTaskAction => {
  const { engine } = useTaskSyncBindings();
  return (taskId: string): void => {
    engine.enqueueDelete(taskId);
    void engine.drain();
  };
};
