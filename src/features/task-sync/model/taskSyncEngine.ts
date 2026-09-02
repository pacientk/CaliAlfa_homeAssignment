import type { Task, TaskChanges, TaskDraft } from '@entities/task/model';
import type { ApiFailure } from '@shared/api';
import { isApiError } from '@shared/api';
import type { ConnectivityService, ScheduleTimer } from '@shared/services/connectivity';
import { scheduleWithTimeout } from '@shared/services/connectivity';
import type { KeyValueStorage } from '@shared/services/storage';

import type { CachedTask } from './CachedTask';
import { backoffDelayMs, classifyDrainFailure } from './drainPolicy';
import type { QueuedMutation } from './QueuedMutation';
import {
  readMutationQueue,
  readTaskCache,
  writeMutationQueue,
  writeTaskCache,
} from './syncStorage';
import {
  applyChanges,
  findTask,
  mergeIntoCache,
  mergeServerList,
  removeTask,
  replaceLocalId,
  upsertTask,
} from './taskCache';
import type { TaskTransport } from './TaskTransport';

/** Everything a consumer needs in one immutable value, shaped for `useSyncExternalStore`. */
export interface TaskSyncSnapshot {
  tasks: CachedTask[];
  pendingCount: number;
  /** What the app believes about the network, and therefore what the banner may say. */
  isOnline: boolean;
  /**
   * Whether a request is worth making now — true while online, and for the single attempt a
   * probe buys after an outage. The banner must not read this: it goes true on a timer, with
   * nothing having happened to justify it.
   */
  shouldAttempt: boolean;
  /** The last failure that was given up on. Retryable failures never appear here. */
  lastFailure?: ApiFailure;
}

export interface TaskSyncEngine {
  /** Stable by reference until something actually changes. */
  getSnapshot(): TaskSyncSnapshot;
  subscribe(listener: () => void): () => void;
  /** Applies the create optimistically and returns the task, carrying a local id. */
  enqueueCreate(draft: TaskDraft): CachedTask;
  /** `undefined` when the cache does not hold the task — nothing is queued in that case. */
  enqueueUpdate(taskId: string, changes: TaskChanges): CachedTask | undefined;
  enqueueDelete(taskId: string): void;
  /** Lands a fetched list in the cache. `observedAt` is the moment it was fetched. */
  mergeServerTasks(serverTasks: readonly Task[], observedAt: string): void;
  /** Sends what it can, in order. Never rejects. */
  drain(): Promise<void>;
  dispose(): void;
}

export interface TaskSyncDependencies {
  storage: KeyValueStorage;
  connectivity: ConnectivityService;
  transport: TaskTransport;
  /** ISO-8601 clock. Injected so tests do not have to mock time globally. */
  now: () => string;
  /** Mints local task ids and queue entry ids. Each call must return a fresh value. */
  createId: () => string;
  scheduleTimer?: ScheduleTimer;
}

/**
 * The offline core: a persisted cache, a persisted queue in front of the API client, and a
 * drain loop.
 *
 * Deliberately plain TypeScript with no React in it. That is what makes the whole of the
 * offline claim testable in-process, and it is why the hooks in T-006 are a thin binding
 * rather than the place the logic lives.
 */
export const createTaskSyncEngine = (dependencies: TaskSyncDependencies): TaskSyncEngine => {
  const { storage, connectivity, transport, now, createId } = dependencies;
  const scheduleTimer = dependencies.scheduleTimer ?? scheduleWithTimeout;

  // Read synchronously at construction, never in an effect: FR-18 requires the cached list
  // to be on screen before the first request, and an async hydration renders one empty frame.
  let tasks: CachedTask[] = readTaskCache(storage);
  let queue: QueuedMutation[] = readMutationQueue(storage);
  let lastFailure: ApiFailure | undefined;
  /**
   * Whether `lastFailure` was recorded by the pass that is running now.
   *
   * It exists so that a success cannot erase a failure the user has not had a chance to see.
   * A queue holding one rejected change and one good one drains both in a single pass, and
   * without this the rollback would be reported and un-reported between two frames — the
   * change would vanish from the screen with nothing left saying why.
   */
  let isFailureFromCurrentDrain = false;
  let drainInFlight: Promise<void> | undefined;
  const listeners = new Set<() => void>();

  const buildSnapshot = (): TaskSyncSnapshot => ({
    tasks,
    pendingCount: queue.length,
    isOnline: connectivity.getIsOnline(),
    shouldAttempt: connectivity.getShouldAttempt(),
    ...(lastFailure === undefined ? {} : { lastFailure }),
  });

  let snapshot: TaskSyncSnapshot = buildSnapshot();

  const notify = (): void => {
    snapshot = buildSnapshot();
    for (const listener of listeners) {
      listener();
    }
  };

  /**
   * Persist, then publish. Both stores are written on every change rather than on a timer,
   * because invariant 7 is that a mutation survives a process that dies immediately after
   * accepting it. MMKV writes are synchronous, so there is nothing to await and no window
   * in which the queue is only in memory.
   */
  const commit = (): void => {
    writeTaskCache(storage, tasks);
    writeMutationQueue(storage, queue);
    notify();
  };

  // --- enqueueing -----------------------------------------------------------

  const appendEntry = (entry: QueuedMutation): void => {
    queue = [...queue, entry];
  };

  const enqueueCreate = (draft: TaskDraft): CachedTask => {
    const writtenAt = now();
    const task: CachedTask = {
      id: createId(),
      title: draft.title,
      description: draft.description,
      category: draft.category,
      isDone: draft.isDone,
      createdAt: draft.createdAt,
      ...(draft.expiresAt === null ? {} : { expiresAt: draft.expiresAt }),
      isLocalId: true,
      lastLocalWriteAt: writtenAt,
    };
    tasks = [...tasks, task];
    appendEntry({
      id: createId(),
      kind: 'create',
      taskId: task.id,
      payload: draft,
      clientTimestamp: writtenAt,
      attempts: 0,
    });
    commit();
    return task;
  };

  const enqueueUpdate = (taskId: string, changes: TaskChanges): CachedTask | undefined => {
    const previous = findTask(tasks, taskId);
    if (previous === undefined) {
      return undefined;
    }
    const writtenAt = now();
    const updated = applyChanges(previous, changes, writtenAt);
    tasks = upsertTask(tasks, updated);
    appendEntry({
      id: createId(),
      kind: 'update',
      taskId,
      payload: changes,
      previous,
      clientTimestamp: writtenAt,
      attempts: 0,
    });
    commit();
    return updated;
  };

  const enqueueDelete = (taskId: string): void => {
    const previous = findTask(tasks, taskId);
    if (previous === undefined) {
      return;
    }
    tasks = removeTask(tasks, taskId);
    appendEntry({
      id: createId(),
      kind: 'delete',
      taskId,
      previous,
      clientTimestamp: now(),
      attempts: 0,
    });
    commit();
  };

  const mergeServerTasks = (serverTasks: readonly Task[], observedAt: string): void => {
    const pendingIds = new Set(queue.map(entry => entry.taskId));
    tasks = mergeServerList(tasks, serverTasks, observedAt, pendingIds);
    commit();
  };

  // --- draining -------------------------------------------------------------

  const sendMutation = (entry: QueuedMutation): Promise<Task> => {
    if (entry.kind === 'create') {
      return transport.createTask(entry.payload);
    }
    if (entry.kind === 'update') {
      return transport.updateTask(entry.taskId, entry.payload);
    }
    return transport.deleteTask(entry.taskId);
  };

  const dropHead = (): void => {
    queue = queue.slice(1);
  };

  /**
   * A create's server id replaces the local one everywhere it is referenced: in the cache,
   * and in every entry still queued behind it. Without the second half, an update queued
   * against a local id would be sent to a task the server has never heard of.
   */
  const reconcileCreate = (entry: QueuedMutation, record: Task): void => {
    tasks = replaceLocalId(tasks, entry.taskId, record, entry.clientTimestamp);
    queue = queue.map(queued =>
      queued.taskId === entry.taskId ? { ...queued, taskId: record.id } : queued,
    );
  };

  const settleSuccess = (entry: QueuedMutation, record: Task): void => {
    dropHead();
    if (entry.kind === 'create') {
      reconcileCreate(entry, record);
    } else if (entry.kind === 'update') {
      // Merged rather than assigned: an edit queued after this request left has a later
      // client timestamp and must survive the response that does not contain it.
      //
      // Guarded on the record still being cached, because a delete queued behind this
      // update has already removed it optimistically. Without the guard the response
      // would put the task back on screen for the one frame before the delete drains,
      // and would persist it in that state if the process died in between.
      const isStillCached = findTask(tasks, entry.taskId) !== undefined;
      tasks = isStillCached ? mergeIntoCache(tasks, record, entry.clientTimestamp) : tasks;
    } else {
      tasks = removeTask(tasks, entry.taskId);
    }
    // A change that got through makes the last rejection stale: it is a sentence about a
    // request that is no longer the most recent thing to have happened, and the banner it
    // occupies is the same one that reports what is still pending. Nothing else clears it,
    // which is how it used to sit on screen until the app was restarted.
    if (!isFailureFromCurrentDrain) {
      lastFailure = undefined;
    }
    commit();
  };

  const rollback = (entry: QueuedMutation): void => {
    if (entry.kind === 'create') {
      tasks = removeTask(tasks, entry.taskId);
      return;
    }
    tasks = upsertTask(tasks, entry.previous);
  };

  /** Keeps the entry at the head, counts the attempt, and comes back after the backoff. */
  const retryHead = (): boolean => {
    const head = queue[0];
    if (head === undefined) {
      return false;
    }
    const retried: QueuedMutation = { ...head, attempts: head.attempts + 1 };
    queue = [retried, ...queue.slice(1)];
    commit();
    scheduleTimer(backoffDelayMs(retried.attempts), () => {
      // `drain` never rejects; the timer has nobody to hand a rejection to anyway.
      void drain();
    });
    return false;
  };

  const discardMissing = (entry: QueuedMutation): boolean => {
    dropHead();
    tasks = removeTask(tasks, entry.taskId);
    commit();
    return true;
  };

  const discardTerminal = (entry: QueuedMutation, failure: ApiFailure): boolean => {
    dropHead();
    rollback(entry);
    lastFailure = failure;
    isFailureFromCurrentDrain = true;
    commit();
    return true;
  };

  const settleFailure = (entry: QueuedMutation, error: unknown): boolean => {
    if (!isApiError(error)) {
      // The API layer throws nothing else, so this is a defect in this app rather than a
      // network condition. Retrying it would block the queue behind it forever.
      return discardTerminal(entry, { kind: 'transport', cause: error });
    }
    const failure = error.failure;
    connectivity.reportFailure(failure);
    const outcome = classifyDrainFailure(failure, entry.kind);
    if (outcome === 'retry') {
      return retryHead();
    }
    if (outcome === 'discardMissing') {
      return discardMissing(entry);
    }
    return discardTerminal(entry, failure);
  };

  /** Sends the head entry. Returns whether the loop should carry on to the next one. */
  const drainHead = async (): Promise<boolean> => {
    if (!connectivity.getShouldAttempt()) {
      return false;
    }
    const head = queue[0];
    if (head === undefined) {
      return false;
    }
    try {
      const record = await sendMutation(head);
      connectivity.reportSuccess();
      settleSuccess(head, record);
      return true;
    } catch (error) {
      return settleFailure(head, error);
    }
  };

  const runDrain = async (): Promise<void> => {
    // Scoped to the pass, not the engine: a failure recorded here has to outlive the
    // successes that follow it in this pass, and must not outlive the pass itself.
    isFailureFromCurrentDrain = false;
    let shouldContinue = true;
    while (shouldContinue) {
      // Sequential on purpose: strict order is invariant 1, and a create must be confirmed
      // before the update that depends on its id is allowed to leave.
      shouldContinue = await drainHead();
    }
  };

  /** Single-flight: a second caller joins the run in progress rather than racing it. */
  const drain = (): Promise<void> => {
    drainInFlight ??= runDrain().finally(() => {
      drainInFlight = undefined;
    });
    return drainInFlight;
  };

  const unsubscribeConnectivity = connectivity.subscribe(() => {
    notify();
    // The permission, not the belief: a probe coming due is exactly the moment to try again,
    // and it is the only thing that can turn a recovered network into evidence.
    if (connectivity.getShouldAttempt()) {
      void drain();
    }
  });

  return {
    getSnapshot: (): TaskSyncSnapshot => snapshot,

    subscribe: (listener: () => void): (() => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    enqueueCreate,
    enqueueUpdate,
    enqueueDelete,
    mergeServerTasks,
    drain,

    dispose: (): void => {
      unsubscribeConnectivity();
      listeners.clear();
    },
  };
};
