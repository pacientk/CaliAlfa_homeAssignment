import type { Task } from '@entities/task/model';

import type { TaskPageSource } from './TaskPageSource';

/**
 * Records per request. Large enough that the usual collection arrives in one round trip,
 * small enough that a cold start on a slow connection is not one long stall.
 */
export const FIRST_SYNC_PAGE_SIZE = 50;

/**
 * The stop that does not depend on the server behaving. The loop's real terminator is a
 * short page; this is the guard for a service that keeps returning full ones, which would
 * otherwise be an unbounded request loop rather than a slow sync.
 */
export const FIRST_SYNC_MAX_PAGES = 20;

/**
 * Pages through the collection until a short page comes back.
 *
 * A page past the end returns `200 []` rather than 404 — probed against the live service
 * and recorded in epic §13 — so an empty page is a normal terminator and not an error to
 * special-case. A short page ends the loop without spending a request to discover the
 * empty one after it.
 */
export const fetchAllTasks = async (
  pageSource: TaskPageSource,
  pageSize: number = FIRST_SYNC_PAGE_SIZE,
): Promise<Task[]> => {
  const collected: Task[] = [];
  for (let page = 1; page <= FIRST_SYNC_MAX_PAGES; page += 1) {
    const records = await pageSource.fetchTaskPage(page, pageSize);
    collected.push(...records);
    if (records.length < pageSize) {
      return collected;
    }
  }
  return collected;
};
