import type { TaskDraft } from '@entities/task/model';

import type { CachedTask } from '../model/CachedTask';
import { useTaskSyncBindings } from '../model/TaskSyncContext';

export type CreateTaskAction = (draft: TaskDraft) => CachedTask;

/**
 * Accepts a create and returns the task it put on screen, carrying a local id.
 *
 * Synchronous by design. The three steps are the engine's — apply optimistically, append
 * to the queue, persist — and the drain is requested rather than awaited, because a
 * mutation that waited for the network would be exactly as slow as the network, which is
 * the thing offline-first exists to avoid. The caller gets the id it needs to navigate
 * before a request has left the device.
 */
export const useCreateTask = (): CreateTaskAction => {
  const { engine } = useTaskSyncBindings();
  return (draft: TaskDraft): CachedTask => {
    const created = engine.enqueueCreate(draft);
    // The engine self-drains when connectivity returns; enqueueing does not, so that a
    // write can never leave a floating promise behind it.
    void engine.drain();
    return created;
  };
};
