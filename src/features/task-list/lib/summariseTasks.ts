import type { Task } from '@entities/task';

export interface TaskSummary {
  readonly completedCount: number;
  readonly totalCount: number;
  /** 0 to 1, for the progress bar's width. Zero on an empty list rather than `NaN`. */
  readonly completedRatio: number;
}

/**
 * The momentum card's counts (FR-16). Expired tasks count towards both, which is why nothing
 * here knows about expiry: the summary is over every task the list holds.
 *
 * The counts are taken from the whole cache and not from the filtered view — a search narrows
 * what is on screen, it does not change how much of the day's work is done.
 */
export const summariseTasks = (tasks: readonly Task[]): TaskSummary => {
  const totalCount = tasks.length;
  const completedCount = tasks.filter(task => task.isDone).length;

  return {
    completedCount,
    totalCount,
    completedRatio: totalCount === 0 ? 0 : completedCount / totalCount,
  };
};
