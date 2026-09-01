import type { Task } from '@entities/task/model';
import { fetchTaskPage } from '@entities/task/model';

/**
 * The read side of the API, named as an interface for the same reason
 * {@link TaskTransport} names the write side: the first-sync loop is then exercised
 * against a fake in-process, with no `fetch` and no device.
 */
export interface TaskPageSource {
  /** `GET /tasks?p={page}&l={limit}`. Pages are 1-based. */
  fetchTaskPage(page: number, limit: number): Promise<Task[]>;
}

/** The production implementation: T-004's typed service function, unchanged. */
export const defaultTaskPageSource: TaskPageSource = { fetchTaskPage };
