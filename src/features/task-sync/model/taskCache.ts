import type { Task, TaskChanges } from '@entities/task/model';

import type { CachedTask } from './CachedTask';
import { mergeServerRecord, toCachedTask } from './CachedTask';

/**
 * Pure transformations of the cached list. Every one returns a new array: the cache is
 * replaced rather than mutated, so a snapshot handed to React is never edited underneath
 * it and `getSnapshot()` can be compared by reference.
 *
 * The array's order carries no meaning. The list screen sorts by `createdAt` (FR-6), so
 * nothing here has to preserve a position — which is what lets a rolled-back delete
 * simply reappear rather than having to remember where it was.
 */

export const findTask = (tasks: readonly CachedTask[], id: string): CachedTask | undefined =>
  tasks.find(task => task.id === id);

export const upsertTask = (tasks: readonly CachedTask[], task: CachedTask): CachedTask[] => {
  const hasTask = tasks.some(candidate => candidate.id === task.id);
  if (!hasTask) {
    return [...tasks, task];
  }
  return tasks.map(candidate => (candidate.id === task.id ? task : candidate));
};

export const removeTask = (tasks: readonly CachedTask[], id: string): CachedTask[] =>
  tasks.filter(task => task.id !== id);

/**
 * Applies an optimistic edit. `expiresAt` has the three states T-004 settled: absent
 * leaves the stored expiry alone, `null` clears it, a string sets it.
 */
export const applyChanges = (
  task: CachedTask,
  changes: TaskChanges,
  writtenAt: string,
): CachedTask => {
  const updated: CachedTask = { ...task, lastLocalWriteAt: writtenAt };
  if (changes.title !== undefined) {
    updated.title = changes.title;
  }
  if (changes.description !== undefined) {
    updated.description = changes.description;
  }
  if (changes.category !== undefined) {
    updated.category = changes.category;
  }
  if (changes.isDone !== undefined) {
    updated.isDone = changes.isDone;
  }
  if (changes.expiresAt === null) {
    delete updated.expiresAt;
    return updated;
  }
  if (changes.expiresAt !== undefined) {
    updated.expiresAt = changes.expiresAt;
  }
  return updated;
};

/**
 * Lands one server record in the cache, last-write-wins against the local copy.
 */
export const mergeIntoCache = (
  tasks: readonly CachedTask[],
  server: Task,
  serverWriteAt: string,
): CachedTask[] =>
  upsertTask(tasks, mergeServerRecord(findTask(tasks, server.id), server, serverWriteAt));

/**
 * Swaps a local id for the server id a create returned.
 *
 * The record is looked up under the local id and re-filed under the server one, which is
 * why this cannot be expressed as an upsert: the key itself changes. A local copy that is
 * already gone — deleted while the create was in flight — leaves the cache untouched
 * rather than reappearing.
 */
export const replaceLocalId = (
  tasks: readonly CachedTask[],
  localId: string,
  server: Task,
  serverWriteAt: string,
): CachedTask[] => {
  const local = findTask(tasks, localId);
  if (local === undefined) {
    return [...tasks];
  }
  const reconciled = mergeServerRecord(local, server, serverWriteAt);
  return tasks.map(task => (task.id === localId ? reconciled : task));
};

/**
 * Replaces the cache with what a full sync returned, keeping what the server cannot know.
 *
 * Two categories survive a sync untouched: tasks created offline, whose ids the server has
 * never seen, and tasks named by `protectedIds` — the targets of entries still in the
 * queue. Protecting the latter is what stops a sync from overwriting an edit that has not
 * drained yet, and from resurrecting a task whose delete is still queued. Everything else
 * is server truth: a record the server no longer lists has been deleted elsewhere and goes.
 */
export const mergeServerList = (
  tasks: readonly CachedTask[],
  serverTasks: readonly Task[],
  observedAt: string,
  protectedIds: ReadonlySet<string>,
): CachedTask[] => {
  const kept = tasks.filter(task => task.isLocalId || protectedIds.has(task.id));
  const keptIds = new Set(kept.map(task => task.id));
  const adopted = serverTasks
    .filter(server => !keptIds.has(server.id) && !protectedIds.has(server.id))
    .map(server => mergeServerRecord(findTask(tasks, server.id), server, observedAt));
  return [...kept, ...adopted];
};

/** Re-exported so callers of this module do not also have to reach for CachedTask.ts. */
export { toCachedTask };
