import type { Task } from '../model/Task';

/**
 * Expiry is **derived**, never stored (epic §10.2). Nothing writes an `isExpired` flag,
 * because a stored flag is wrong the moment the clock passes it and the app is not running.
 *
 * The comparison is between two ISO-8601 strings rather than two `Date` objects: every
 * timestamp in this app comes from `Date.toISOString()` — fixed width, UTC, zero-padded — so
 * lexicographic order is chronological order, and no date is parsed to answer the question.
 *
 * `at` is passed in rather than read from the clock here so the caller decides *when* "now"
 * is. That is what makes the rendered list self-consistent: every row on a pass is judged
 * against the same instant, and the instant is refreshed on a lifecycle event rather than
 * drifting one row at a time.
 */
export const isTaskExpired = (task: Pick<Task, 'expiresAt'>, at: string): boolean =>
  task.expiresAt !== undefined && task.expiresAt < at;
