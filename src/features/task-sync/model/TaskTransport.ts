import type { Task, TaskChanges, TaskDraft } from '@entities/task/model';
import { createTask, deleteTask, updateTask } from '@entities/task/model';

/**
 * The three calls the drain makes, named as an interface so the queue depends on the
 * shape rather than on the module. That is what lets the whole drain be exercised against
 * a fake in-process, with no `fetch` and no device.
 *
 * Reads are absent on purpose: the queue only writes. The first sync belongs to T-006.
 */
export interface TaskTransport {
  createTask(draft: TaskDraft): Promise<Task>;
  updateTask(id: string, changes: TaskChanges): Promise<Task>;
  deleteTask(id: string): Promise<Task>;
}

/** The production implementation: T-004's typed service functions, unchanged. */
export const defaultTaskTransport: TaskTransport = { createTask, updateTask, deleteTask };
