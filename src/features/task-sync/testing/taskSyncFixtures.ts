import type { Task, TaskDraft } from '@entities/task/model';

import type { CachedTask } from '../model/CachedTask';

const BASE_YEAR = 2026;
/** September, zero-based, as `Date.UTC` counts months. */
const BASE_MONTH = 8;
const BASE_DAY = 1;
const BASE_HOUR = 12;

const BASE_TIME_MS = Date.UTC(BASE_YEAR, BASE_MONTH, BASE_DAY, BASE_HOUR, 0, 0);
const SECOND_MS = 1000;

/** A readable, strictly increasing ISO clock. `isoAt(2)` is later than `isoAt(1)`. */
export const isoAt = (step: number): string =>
  new Date(BASE_TIME_MS + step * SECOND_MS).toISOString();

export const draftOf = (overrides: Partial<TaskDraft> = {}): TaskDraft => ({
  title: 'Ship the data layer',
  description: 'Hooks over the queue',
  category: 'Work',
  isDone: false,
  createdAt: isoAt(1),
  expiresAt: null,
  ...overrides,
});

export const serverTaskOf = (id: string, overrides: Partial<Task> = {}): Task => ({
  id,
  title: 'Ship the data layer',
  description: 'Hooks over the queue',
  category: 'Work',
  isDone: false,
  createdAt: isoAt(1),
  ...overrides,
});

export const cachedTaskOf = (id: string, overrides: Partial<CachedTask> = {}): CachedTask => ({
  ...serverTaskOf(id),
  isLocalId: false,
  lastLocalWriteAt: isoAt(1),
  ...overrides,
});
