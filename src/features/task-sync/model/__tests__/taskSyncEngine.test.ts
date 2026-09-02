import type { Task, TaskChanges, TaskDraft } from '@entities/task/model';
import type { ApiFailure } from '@shared/api';
import { ApiError } from '@shared/api';
import type { ConnectivityService } from '@shared/services/connectivity';
import type { KeyValueStorage } from '@shared/services/storage';
import { createMemoryStorage } from '@shared/services/storage';

import { backoffDelayMs } from '../drainPolicy';
import type { MutationKind } from '../QueuedMutation';
import { readMutationQueue, readTaskCache } from '../syncStorage';
import type { TaskSyncEngine } from '../taskSyncEngine';
import { createTaskSyncEngine } from '../taskSyncEngine';
import type { TaskTransport } from '../TaskTransport';

// --- fixtures ---------------------------------------------------------------

const BASE_TIME_MS = Date.UTC(2026, 8, 1, 12, 0, 0);
const SECOND_MS = 1000;

/** A readable, strictly increasing ISO clock. `isoAt(2)` is later than `isoAt(1)`. */
const isoAt = (step: number): string => new Date(BASE_TIME_MS + step * SECOND_MS).toISOString();

const draftOf = (overrides: Partial<TaskDraft> = {}): TaskDraft => ({
  title: 'Ship the queue',
  description: 'Before the code',
  category: 'Work',
  isDone: false,
  createdAt: isoAt(1),
  expiresAt: null,
  ...overrides,
});

const serverTask = (id: string, overrides: Partial<Task> = {}): Task => ({
  id,
  title: 'Ship the queue',
  description: 'Before the code',
  category: 'Work',
  isDone: false,
  createdAt: isoAt(1),
  ...overrides,
});

// --- doubles ----------------------------------------------------------------

interface FakeConnectivity extends ConnectivityService {
  setIsOnline(isNextOnline: boolean): void;
  /** Grants the one attempt a probe buys, without claiming the network is back. */
  setProbeDue(isNextProbeDue: boolean): void;
  readonly reportedFailures: ApiFailure[];
}

const createFakeConnectivity = (): FakeConnectivity => {
  let isOnline = true;
  let isProbeDue = false;
  const listeners = new Set<() => void>();
  const reportedFailures: ApiFailure[] = [];

  return {
    reportedFailures,
    getIsOnline: (): boolean => isOnline,
    getShouldAttempt: (): boolean => isOnline || isProbeDue,
    subscribe: (listener: () => void): (() => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    reportSuccess: (): void => undefined,
    reportFailure: (failure: ApiFailure): void => {
      reportedFailures.push(failure);
    },
    setIsOnline: (isNextOnline: boolean): void => {
      if (isOnline === isNextOnline) {
        return;
      }
      isOnline = isNextOnline;
      isProbeDue = false;
      for (const listener of listeners) {
        listener();
      }
    },
    setProbeDue: (isNextProbeDue: boolean): void => {
      if (isProbeDue === isNextProbeDue) {
        return;
      }
      isProbeDue = isNextProbeDue;
      for (const listener of listeners) {
        listener();
      }
    },
  };
};

type Outcome = { task: Task } | { error: Error };

/** One request as the server would have received it. */
interface TransportCall {
  kind: MutationKind;
  taskId?: string;
  draft?: TaskDraft;
  changes?: TaskChanges;
}

interface FakeTransport extends TaskTransport {
  readonly calls: TransportCall[];
  script(kind: MutationKind, ...outcomes: Outcome[]): void;
}

const createFakeTransport = (): FakeTransport => {
  const calls: TransportCall[] = [];
  const scripted = new Map<MutationKind, Outcome[]>([
    ['create', []],
    ['update', []],
    ['delete', []],
  ]);

  const settle = (kind: MutationKind, fallback: Task): Promise<Task> => {
    const outcome = scripted.get(kind)?.shift() ?? { task: fallback };
    if ('error' in outcome) {
      return Promise.reject(outcome.error);
    }
    return Promise.resolve(outcome.task);
  };

  return {
    calls,
    script: (kind: MutationKind, ...outcomes: Outcome[]): void => {
      scripted.get(kind)?.push(...outcomes);
    },
    createTask: (draft: TaskDraft): Promise<Task> => {
      calls.push({ kind: 'create', draft });
      return settle('create', serverTask(`server-${calls.length}`, { title: draft.title }));
    },
    updateTask: (id: string, changes: TaskChanges): Promise<Task> => {
      calls.push({ kind: 'update', taskId: id, changes });
      return settle('update', serverTask(id));
    },
    deleteTask: (id: string): Promise<Task> => {
      calls.push({ kind: 'delete', taskId: id });
      return settle('delete', serverTask(id));
    },
  };
};

interface ScheduledTimer {
  delayMs: number;
  run: () => void;
}

interface Harness {
  storage: KeyValueStorage;
  connectivity: FakeConnectivity;
  transport: FakeTransport;
  timers: ScheduledTimer[];
  engine: TaskSyncEngine;
  advanceClock: () => void;
}

const setup = (storage: KeyValueStorage = createMemoryStorage()): Harness => {
  let step = 1;
  let idCount = 0;
  const connectivity = createFakeConnectivity();
  const transport = createFakeTransport();
  const timers: ScheduledTimer[] = [];

  const engine = createTaskSyncEngine({
    storage,
    connectivity,
    transport,
    now: () => isoAt(step),
    createId: () => {
      idCount += 1;
      return `gen-${idCount}`;
    },
    scheduleTimer: (delayMs, run) => {
      timers.push({ delayMs, run });
    },
  });

  return {
    storage,
    connectivity,
    transport,
    timers,
    engine,
    advanceClock: () => {
      step += 1;
    },
  };
};

const fireOldestTimer = async (harness: Harness): Promise<void> => {
  const timer = harness.timers.shift();
  if (timer === undefined) {
    throw new Error('expected a scheduled retry');
  }
  timer.run();
  await harness.engine.drain();
};

// --- S-1 / AC-1 -------------------------------------------------------------

describe('S-1 — a create and an update queued offline, then drained', () => {
  const arrange = async (): Promise<Harness> => {
    const harness = setup();
    harness.connectivity.setIsOnline(false);
    const local = harness.engine.enqueueCreate(draftOf());
    harness.advanceClock();
    harness.engine.enqueueUpdate(local.id, { title: 'Renamed' });
    harness.transport.script('create', { task: serverTask('server-77') });
    harness.transport.script('update', { task: serverTask('server-77', { title: 'Renamed' }) });
    harness.connectivity.setIsOnline(true);
    await harness.engine.drain();
    return harness;
  };

  it('sends the create before the update', async () => {
    const harness = await arrange();
    expect(harness.transport.calls.map(call => call.kind)).toEqual(['create', 'update']);
  });

  it('sends the update against the id the server returned, not against the local one', async () => {
    const harness = await arrange();
    expect(harness.transport.calls[1]?.taskId).toBe('server-77');
  });

  it('leaves the cache in storage holding the server id and no local-id flag', async () => {
    const harness = await arrange();
    const cached = readTaskCache(harness.storage);
    expect(cached).toHaveLength(1);
    expect(cached[0]?.id).toBe('server-77');
    expect(cached[0]?.isLocalId).toBe(false);
  });

  it('leaves the cache in storage holding the edited title', async () => {
    const harness = await arrange();
    expect(readTaskCache(harness.storage)[0]?.title).toBe('Renamed');
  });

  it('leaves the queue in storage empty', async () => {
    const harness = await arrange();
    expect(readMutationQueue(harness.storage)).toEqual([]);
  });

  it('retargets every later entry, not only the next one', async () => {
    const harness = setup();
    harness.connectivity.setIsOnline(false);
    const local = harness.engine.enqueueCreate(draftOf());
    harness.advanceClock();
    harness.engine.enqueueUpdate(local.id, { title: 'Renamed' });
    harness.engine.enqueueDelete(local.id);
    harness.transport.script('create', { task: serverTask('server-77') });
    harness.connectivity.setIsOnline(true);
    await harness.engine.drain();

    expect(harness.transport.calls.map(call => call.taskId)).toEqual([
      undefined,
      'server-77',
      'server-77',
    ]);
  });

  it('stops at a failing head rather than sending later entries out of order', async () => {
    const harness = setup();
    harness.engine.enqueueCreate(draftOf({ title: 'First' }));
    harness.engine.enqueueCreate(draftOf({ title: 'Second' }));
    harness.transport.script('create', { error: new ApiError({ kind: 'server', status: 500 }) });
    await harness.engine.drain();

    expect(harness.transport.calls).toHaveLength(1);
    expect(readMutationQueue(harness.storage)).toHaveLength(2);
  });

  it('does not send the head twice when two drains overlap', async () => {
    const harness = setup();
    harness.engine.enqueueCreate(draftOf());
    await Promise.all([harness.engine.drain(), harness.engine.drain()]);
    expect(harness.transport.calls).toHaveLength(1);
  });
});

// --- S-2 / AC-2 -------------------------------------------------------------

describe('S-2 — the queue survives the process', () => {
  const arrangeStorage = (): KeyValueStorage => {
    const storage = createMemoryStorage();
    const first = setup(storage);
    first.connectivity.setIsOnline(false);
    const local = first.engine.enqueueCreate(draftOf());
    first.advanceClock();
    first.engine.enqueueUpdate(local.id, { title: 'Renamed' });
    first.engine.dispose();
    return storage;
  };

  it('persists both entries in order, read straight out of storage', () => {
    const queue = readMutationQueue(arrangeStorage());
    expect(queue.map(entry => entry.kind)).toEqual(['create', 'update']);
  });

  it('persists the local id the update targets', () => {
    const queue = readMutationQueue(arrangeStorage());
    expect(queue[1]?.taskId).toBe(queue[0]?.taskId);
  });

  it('restores an identical queue into a brand new instance', () => {
    const storage = arrangeStorage();
    const persisted = readMutationQueue(storage);
    const second = setup(storage);
    expect(second.engine.getSnapshot().pendingCount).toBe(persisted.length);
    expect(readMutationQueue(storage)).toEqual(persisted);
  });

  it('restores the cache into a brand new instance', () => {
    const storage = arrangeStorage();
    const second = setup(storage);
    expect(second.engine.getSnapshot().tasks.map(task => task.title)).toEqual(['Renamed']);
  });

  it('drains the restored entries in the original order, against the reconciled id', async () => {
    const storage = arrangeStorage();
    const second = setup(storage);
    second.transport.script('create', { task: serverTask('server-77') });
    await second.engine.drain();

    expect(second.transport.calls.map(call => call.kind)).toEqual(['create', 'update']);
    expect(second.transport.calls[1]?.taskId).toBe('server-77');
    expect(readMutationQueue(storage)).toEqual([]);
  });

  it('persists on the mutation itself, before any drain has run', () => {
    const harness = setup();
    harness.connectivity.setIsOnline(false);
    harness.engine.enqueueCreate(draftOf());

    expect(readMutationQueue(harness.storage)).toHaveLength(1);
    expect(readTaskCache(harness.storage)).toHaveLength(1);
    expect(harness.transport.calls).toEqual([]);
  });
});

// --- S-3 / AC-3 -------------------------------------------------------------

describe('S-3 — a terminal 4xx on the head', () => {
  const arrange = async (): Promise<Harness> => {
    const harness = setup();
    harness.engine.mergeServerTasks([serverTask('server-1', { title: 'Original' })], isoAt(0));
    harness.advanceClock();
    harness.engine.enqueueUpdate('server-1', { title: 'Renamed' });
    harness.transport.script('update', { error: new ApiError({ kind: 'client', status: 400 }) });
    await harness.engine.drain();
    return harness;
  };

  it('discards the entry from the queue in storage', async () => {
    const harness = await arrange();
    expect(readMutationQueue(harness.storage)).toEqual([]);
  });

  it('rolls the optimistic change back in the cache in storage', async () => {
    const harness = await arrange();
    expect(readTaskCache(harness.storage)[0]?.title).toBe('Original');
  });

  it('attempts no retry', async () => {
    const harness = await arrange();
    expect(harness.transport.calls).toHaveLength(1);
    expect(harness.timers).toEqual([]);
  });

  it('surfaces the failure exactly once', async () => {
    const harness = await arrange();
    expect(harness.engine.getSnapshot().lastFailure).toEqual({ kind: 'client', status: 400 });
    await harness.engine.drain();
    expect(harness.transport.calls).toHaveLength(1);
  });

  it('clears the surfaced failure once a later change gets through', async () => {
    const harness = await arrange();
    expect(harness.engine.getSnapshot().lastFailure).toBeDefined();

    harness.engine.enqueueUpdate('server-1', { title: 'Renamed again' });
    await harness.engine.drain();

    expect(harness.engine.getSnapshot().lastFailure).toBeUndefined();
  });

  it('keeps a failure that the same pass went on to drain past', async () => {
    const harness = setup();
    harness.engine.mergeServerTasks([serverTask('server-1', { title: 'Original' })], isoAt(0));
    harness.advanceClock();
    // Two entries, drained in one pass: the first is refused, the second goes through. The
    // rollback is the only thing the user can see happen, so the sentence explaining it has
    // to outlive the success queued behind it.
    harness.engine.enqueueUpdate('server-1', { title: 'Renamed' });
    harness.engine.enqueueCreate(draftOf());
    harness.transport.script('update', { error: new ApiError({ kind: 'client', status: 400 }) });

    await harness.engine.drain();

    expect(harness.engine.getSnapshot().lastFailure).toEqual({ kind: 'client', status: 400 });
    expect(harness.engine.getSnapshot().pendingCount).toBe(0);
  });

  it('removes a task whose create failed terminally', async () => {
    const harness = setup();
    harness.engine.enqueueCreate(draftOf());
    harness.transport.script('create', { error: new ApiError({ kind: 'client', status: 422 }) });
    await harness.engine.drain();

    expect(readTaskCache(harness.storage)).toEqual([]);
    expect(readMutationQueue(harness.storage)).toEqual([]);
  });

  it('restores a task whose delete failed terminally', async () => {
    const harness = setup();
    harness.engine.mergeServerTasks([serverTask('server-1', { title: 'Original' })], isoAt(0));
    harness.engine.enqueueDelete('server-1');
    harness.transport.script('delete', { error: new ApiError({ kind: 'client', status: 400 }) });
    await harness.engine.drain();

    expect(readTaskCache(harness.storage).map(task => task.title)).toEqual(['Original']);
  });

  it('discards an entry that failed with something other than an ApiError', async () => {
    const harness = setup();
    harness.engine.enqueueCreate(draftOf());
    harness.transport.script('create', { error: new Error('a defect in this app') });
    await harness.engine.drain();

    expect(readMutationQueue(harness.storage)).toEqual([]);
    expect(readTaskCache(harness.storage)).toEqual([]);
  });

  it('does not resurrect a task that was deleted while its update was in flight', async () => {
    const harness = setup();
    harness.engine.mergeServerTasks([serverTask('server-1')], isoAt(0));
    harness.advanceClock();
    harness.engine.enqueueUpdate('server-1', { title: 'Renamed' });
    harness.engine.enqueueDelete('server-1');
    await harness.engine.drain();

    expect(harness.transport.calls.map(call => call.kind)).toEqual(['update', 'delete']);
    expect(readTaskCache(harness.storage)).toEqual([]);
    expect(readMutationQueue(harness.storage)).toEqual([]);
  });

  it('never puts the deleted task back on screen, not even for one frame', async () => {
    const harness = setup();
    harness.engine.mergeServerTasks([serverTask('server-1')], isoAt(0));
    harness.advanceClock();
    harness.engine.enqueueUpdate('server-1', { title: 'Renamed' });
    harness.engine.enqueueDelete('server-1');

    const observed: number[] = [];
    harness.engine.subscribe(() => {
      observed.push(harness.engine.getSnapshot().tasks.length);
    });
    await harness.engine.drain();

    expect(observed).not.toContain(1);
  });

  it('keeps draining the entries behind a discarded one', async () => {
    const harness = setup();
    harness.engine.enqueueCreate(draftOf({ title: 'First' }));
    harness.engine.enqueueCreate(draftOf({ title: 'Second' }));
    harness.transport.script('create', { error: new ApiError({ kind: 'client', status: 400 }) });
    await harness.engine.drain();

    expect(harness.transport.calls).toHaveLength(2);
    expect(readMutationQueue(harness.storage)).toEqual([]);
  });
});

// --- S-4 / AC-4 -------------------------------------------------------------

describe('S-4 — a retryable 5xx on the head', () => {
  const arrange = async (): Promise<Harness> => {
    const harness = setup();
    harness.engine.mergeServerTasks([serverTask('server-1', { title: 'Original' })], isoAt(0));
    harness.advanceClock();
    harness.engine.enqueueUpdate('server-1', { title: 'Renamed' });
    harness.transport.script('update', { error: new ApiError({ kind: 'server', status: 503 }) });
    await harness.engine.drain();
    return harness;
  };

  it('leaves the entry at the head of the queue in storage', async () => {
    const harness = await arrange();
    const queue = readMutationQueue(harness.storage);
    expect(queue).toHaveLength(1);
    expect(queue[0]?.kind).toBe('update');
  });

  it('increments the attempt count', async () => {
    const harness = await arrange();
    expect(readMutationQueue(harness.storage)[0]?.attempts).toBe(1);
  });

  it('keeps the optimistic change in the cache — the write has not failed yet', async () => {
    const harness = await arrange();
    expect(readTaskCache(harness.storage)[0]?.title).toBe('Renamed');
  });

  it('surfaces nothing to the user for a failure that will be retried', async () => {
    const harness = await arrange();
    expect(harness.engine.getSnapshot().lastFailure).toBeUndefined();
  });

  it('schedules the retry at the backoff delay for the new attempt count', async () => {
    const harness = await arrange();
    expect(harness.timers.map(timer => timer.delayMs)).toEqual([backoffDelayMs(1)]);
  });

  it('backs off further when the retry fails again', async () => {
    const harness = await arrange();
    harness.transport.script('update', { error: new ApiError({ kind: 'server', status: 503 }) });
    await fireOldestTimer(harness);

    expect(readMutationQueue(harness.storage)[0]?.attempts).toBe(2);
    expect(harness.timers.map(timer => timer.delayMs)).toEqual([backoffDelayMs(2)]);
  });

  it('removes the entry when the retry succeeds — the paired negative case', async () => {
    const harness = await arrange();
    harness.transport.script('update', { task: serverTask('server-1', { title: 'Renamed' }) });
    await fireOldestTimer(harness);

    expect(readMutationQueue(harness.storage)).toEqual([]);
    expect(readTaskCache(harness.storage)[0]?.title).toBe('Renamed');
  });

  it('reports the failure to the connectivity service so the banner can react', async () => {
    const harness = await arrange();
    expect(harness.connectivity.reportedFailures).toEqual([{ kind: 'server', status: 503 }]);
  });
});

// --- S-5 / AC-5 -------------------------------------------------------------

describe('S-5 — draining while offline', () => {
  it('issues no request at all', async () => {
    const harness = setup();
    harness.connectivity.setIsOnline(false);
    harness.engine.enqueueCreate(draftOf());
    await harness.engine.drain();

    expect(harness.transport.calls).toEqual([]);
    expect(readMutationQueue(harness.storage)).toHaveLength(1);
  });

  it('burns no attempt on an entry it never sent', async () => {
    const harness = setup();
    harness.connectivity.setIsOnline(false);
    harness.engine.enqueueCreate(draftOf());
    await harness.engine.drain();

    expect(readMutationQueue(harness.storage)[0]?.attempts).toBe(0);
  });

  it('issues the request once connectivity returns — the paired positive case', async () => {
    const harness = setup();
    harness.connectivity.setIsOnline(false);
    harness.engine.enqueueCreate(draftOf());
    await harness.engine.drain();
    harness.connectivity.setIsOnline(true);
    await harness.engine.drain();

    expect(harness.transport.calls.map(call => call.kind)).toEqual(['create']);
  });

  it('drains by itself when connectivity returns, with nobody asking', async () => {
    const harness = setup();
    harness.connectivity.setIsOnline(false);
    harness.engine.enqueueCreate(draftOf());
    harness.connectivity.setIsOnline(true);
    await harness.engine.drain();

    expect(harness.transport.calls).toHaveLength(1);
  });

  it('stops listening to connectivity once disposed', async () => {
    const harness = setup();
    harness.connectivity.setIsOnline(false);
    harness.engine.enqueueCreate(draftOf());
    harness.engine.dispose();
    harness.connectivity.setIsOnline(true);
    await Promise.resolve();

    expect(harness.transport.calls).toEqual([]);
  });
});

// --- S-6 / AC-6 -------------------------------------------------------------

describe('S-6 — last-write-wins when a server list is merged', () => {
  it('lets the server win over an older local copy', () => {
    const harness = setup();
    harness.engine.mergeServerTasks([serverTask('server-1', { title: 'First' })], isoAt(1));
    harness.engine.mergeServerTasks([serverTask('server-1', { title: 'Second' })], isoAt(5));

    expect(readTaskCache(harness.storage)[0]?.title).toBe('Second');
  });

  it('lets a newer local copy win over the server', () => {
    const harness = setup();
    harness.engine.mergeServerTasks([serverTask('server-1', { title: 'Local' })], isoAt(5));
    harness.engine.mergeServerTasks([serverTask('server-1', { title: 'Server' })], isoAt(3));

    expect(readTaskCache(harness.storage)[0]?.title).toBe('Local');
  });

  it('protects a record with a queued change from being overwritten', () => {
    const harness = setup();
    harness.engine.mergeServerTasks([serverTask('server-1', { title: 'Original' })], isoAt(0));
    harness.advanceClock();
    harness.engine.enqueueUpdate('server-1', { title: 'Renamed' });
    harness.engine.mergeServerTasks(
      [serverTask('server-1', { title: 'From elsewhere' })],
      isoAt(9),
    );

    expect(readTaskCache(harness.storage)[0]?.title).toBe('Renamed');
  });

  it('keeps a task created offline, which no server list can contain yet', () => {
    const harness = setup();
    harness.connectivity.setIsOnline(false);
    harness.engine.enqueueCreate(draftOf({ title: 'Offline task' }));
    harness.engine.mergeServerTasks([serverTask('server-1')], isoAt(9));

    const titles = readTaskCache(harness.storage).map(task => task.title);
    expect(titles).toContain('Offline task');
    expect(titles).toContain('Ship the queue');
  });

  it('drops a synced record the server no longer has', () => {
    const harness = setup();
    harness.engine.mergeServerTasks([serverTask('server-1'), serverTask('server-2')], isoAt(1));
    harness.engine.mergeServerTasks([serverTask('server-1')], isoAt(2));

    expect(readTaskCache(harness.storage).map(task => task.id)).toEqual(['server-1']);
  });
});

// --- invariant 5: a record that is gone --------------------------------------

describe('a 404 on the head', () => {
  it('removes the local copy of an updated record and does not retry', async () => {
    const harness = setup();
    harness.engine.mergeServerTasks([serverTask('server-1')], isoAt(0));
    harness.advanceClock();
    harness.engine.enqueueUpdate('server-1', { title: 'Renamed' });
    harness.transport.script('update', { error: new ApiError({ kind: 'notFound' }) });
    await harness.engine.drain();

    expect(readTaskCache(harness.storage)).toEqual([]);
    expect(readMutationQueue(harness.storage)).toEqual([]);
    expect(harness.timers).toEqual([]);
  });

  it('surfaces nothing — a record that is already gone is not an error', async () => {
    const harness = setup();
    harness.engine.mergeServerTasks([serverTask('server-1')], isoAt(0));
    harness.engine.enqueueDelete('server-1');
    harness.transport.script('delete', { error: new ApiError({ kind: 'notFound' }) });
    await harness.engine.drain();

    expect(harness.engine.getSnapshot().lastFailure).toBeUndefined();
    expect(readMutationQueue(harness.storage)).toEqual([]);
  });

  it('retries instead when the same entry gets a 5xx — the paired case', async () => {
    const harness = setup();
    harness.engine.mergeServerTasks([serverTask('server-1')], isoAt(0));
    harness.advanceClock();
    harness.engine.enqueueUpdate('server-1', { title: 'Renamed' });
    harness.transport.script('update', { error: new ApiError({ kind: 'server', status: 500 }) });
    await harness.engine.drain();

    expect(readTaskCache(harness.storage)).toHaveLength(1);
    expect(readMutationQueue(harness.storage)).toHaveLength(1);
  });
});

// --- the enqueue surface -----------------------------------------------------

describe('enqueueing a mutation', () => {
  it('returns the optimistic task carrying a local id', () => {
    const harness = setup();
    const task = harness.engine.enqueueCreate(draftOf());
    expect(task.isLocalId).toBe(true);
    expect(task.lastLocalWriteAt).toBe(isoAt(1));
  });

  it('records a create with no expiry as a task with no expiry key', () => {
    const harness = setup();
    harness.engine.enqueueCreate(draftOf({ expiresAt: null }));
    expect('expiresAt' in (readTaskCache(harness.storage)[0] ?? {})).toBe(false);
  });

  it('records a create with an expiry', () => {
    const harness = setup();
    harness.engine.enqueueCreate(draftOf({ expiresAt: isoAt(99) }));
    expect(readTaskCache(harness.storage)[0]?.expiresAt).toBe(isoAt(99));
  });

  it('queues nothing for an update against a task the cache does not hold', () => {
    const harness = setup();
    expect(harness.engine.enqueueUpdate('server-9', { title: 'Renamed' })).toBeUndefined();
    expect(readMutationQueue(harness.storage)).toEqual([]);
  });

  it('queues nothing for a delete against a task the cache does not hold', () => {
    const harness = setup();
    harness.engine.enqueueDelete('server-9');
    expect(readMutationQueue(harness.storage)).toEqual([]);
  });

  it('removes the task from the cache the moment a delete is queued', () => {
    const harness = setup();
    harness.engine.mergeServerTasks([serverTask('server-1')], isoAt(0));
    harness.engine.enqueueDelete('server-1');
    expect(readTaskCache(harness.storage)).toEqual([]);
  });

  it('sends the create with the draft the caller supplied, expiry sentinel included', async () => {
    const harness = setup();
    harness.engine.enqueueCreate(draftOf({ expiresAt: null }));
    await harness.engine.drain();
    expect(harness.transport.calls[0]?.draft?.expiresAt).toBeNull();
  });
});

// --- the snapshot surface ----------------------------------------------------

describe('the snapshot T-006 will bind to', () => {
  it('counts the entries still waiting', () => {
    const harness = setup();
    harness.connectivity.setIsOnline(false);
    harness.engine.enqueueCreate(draftOf());
    harness.engine.enqueueCreate(draftOf());
    expect(harness.engine.getSnapshot().pendingCount).toBe(2);
  });

  it('reports connectivity', () => {
    const harness = setup();
    harness.connectivity.setIsOnline(false);
    expect(harness.engine.getSnapshot().isOnline).toBe(false);
  });

  it('keeps the same object identity while nothing changes', () => {
    const harness = setup();
    expect(harness.engine.getSnapshot()).toBe(harness.engine.getSnapshot());
  });

  it('produces a new object once something changes', () => {
    const harness = setup();
    const before = harness.engine.getSnapshot();
    harness.engine.enqueueCreate(draftOf());
    expect(harness.engine.getSnapshot()).not.toBe(before);
  });

  it('notifies subscribers when a mutation is queued', () => {
    const harness = setup();
    const listener = jest.fn();
    harness.engine.subscribe(listener);
    harness.engine.enqueueCreate(draftOf());
    expect(listener).toHaveBeenCalled();
  });

  it('notifies subscribers when connectivity changes', () => {
    const harness = setup();
    const listener = jest.fn();
    harness.engine.subscribe(listener);
    harness.connectivity.setIsOnline(false);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('stops notifying an unsubscribed listener', () => {
    const harness = setup();
    const listener = jest.fn();
    harness.engine.subscribe(listener)();
    harness.engine.enqueueCreate(draftOf());
    expect(listener).not.toHaveBeenCalled();
  });
});

/**
 * The snapshot feeds the offline banner, and the two connectivity answers are easy to confuse:
 * one is what the app believes, the other is permission to spend a request finding out. Wiring
 * the banner to the second is the defect these pin — it made the indicator flicker green once
 * every probe for the whole of an outage, and vanish entirely when there was nothing queued to
 * fail again.
 */
describe('what the snapshot tells the banner while the device is offline', () => {
  it('publishes the belief, so a probe coming due does not read as a connection', () => {
    const harness = setup();
    harness.connectivity.setIsOnline(false);

    harness.connectivity.setProbeDue(true);

    expect(harness.engine.getSnapshot().isOnline).toBe(false);
    expect(harness.engine.getSnapshot().shouldAttempt).toBe(true);
  });

  it('wakes the drain itself when the probe comes due, without being asked to', async () => {
    const harness = setup();
    harness.connectivity.setIsOnline(false);
    harness.engine.enqueueCreate(draftOf());
    expect(harness.transport.calls).toHaveLength(0);

    // Nothing calls `drain` here. The engine subscribes to connectivity, and a probe coming due
    // is the only moment during an outage when an attempt is worth making.
    harness.connectivity.setProbeDue(true);
    await Promise.resolve();

    expect(harness.transport.calls).toHaveLength(1);
  });

  it('still spends the attempt the probe bought, believing itself offline the whole time', async () => {
    const harness = setup();
    harness.connectivity.setIsOnline(false);
    harness.engine.enqueueCreate(draftOf());
    expect(harness.transport.calls).toHaveLength(0);

    harness.connectivity.setProbeDue(true);
    await harness.engine.drain();

    expect(harness.transport.calls).toHaveLength(1);
    expect(harness.engine.getSnapshot().isOnline).toBe(false);
  });
});
