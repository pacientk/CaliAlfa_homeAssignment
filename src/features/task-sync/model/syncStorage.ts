import type { KeyValueStorage } from '@shared/services/storage';
import { readJson, writeJson } from '@shared/services/storage';

import type { CachedTask } from './CachedTask';
import { isCachedTask } from './CachedTask';
import type { QueuedMutation } from './QueuedMutation';
import { isQueuedMutation } from './QueuedMutation';

/**
 * Versioned keys. A shape change ships under `.v2` and leaves the old data to be ignored,
 * which is cheaper and safer than migrating a queue whose entries may be half-drained.
 */
export const TASK_CACHE_KEY = 'focus-flow.task-cache.v1';
export const MUTATION_QUEUE_KEY = 'focus-flow.mutation-queue.v1';

/**
 * Restores a list, dropping any element that fails its guard.
 *
 * Dropping rather than throwing is deliberate: this runs during app start, and a single
 * malformed record — written by an older build, or truncated by a crash mid-write — must
 * not be able to stop the app from opening. A dropped queue entry loses one unsynced
 * change; a throw here would lose the whole app.
 */
const readList = <T>(
  storage: KeyValueStorage,
  key: string,
  isValid: (value: unknown) => value is T,
): T[] =>
  readJson(storage, key, (raw: unknown): T[] | undefined =>
    Array.isArray(raw) ? raw.filter(isValid) : undefined,
  ) ?? [];

export const readTaskCache = (storage: KeyValueStorage): CachedTask[] =>
  readList(storage, TASK_CACHE_KEY, isCachedTask);

export const writeTaskCache = (storage: KeyValueStorage, tasks: readonly CachedTask[]): void => {
  writeJson(storage, TASK_CACHE_KEY, tasks);
};

export const readMutationQueue = (storage: KeyValueStorage): QueuedMutation[] =>
  readList(storage, MUTATION_QUEUE_KEY, isQueuedMutation);

export const writeMutationQueue = (
  storage: KeyValueStorage,
  queue: readonly QueuedMutation[],
): void => {
  writeJson(storage, MUTATION_QUEUE_KEY, queue);
};
