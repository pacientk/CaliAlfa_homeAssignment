import { createMemoryStorage } from '@shared/services/storage';

import type { CachedTask } from '../CachedTask';
import type { QueuedMutation } from '../QueuedMutation';
import {
  MUTATION_QUEUE_KEY,
  readMutationQueue,
  readTaskCache,
  TASK_CACHE_KEY,
  writeMutationQueue,
  writeTaskCache,
} from '../syncStorage';

const T1 = '2026-09-01T12:00:01.000Z';

const task: CachedTask = {
  id: 'server-1',
  title: 'Ship the queue',
  description: 'Before the code',
  category: 'Work',
  isDone: false,
  createdAt: T1,
  isLocalId: false,
  lastLocalWriteAt: T1,
};

const createEntry: QueuedMutation = {
  id: 'entry-1',
  kind: 'create',
  taskId: 'local-1',
  clientTimestamp: T1,
  attempts: 0,
  payload: {
    title: 'Ship the queue',
    description: 'Before the code',
    category: 'Work',
    isDone: false,
    createdAt: T1,
    expiresAt: null,
  },
};

const updateEntry: QueuedMutation = {
  id: 'entry-2',
  kind: 'update',
  taskId: 'server-1',
  clientTimestamp: T1,
  attempts: 2,
  payload: { title: 'Renamed', expiresAt: null },
  previous: task,
};

const deleteEntry: QueuedMutation = {
  id: 'entry-3',
  kind: 'delete',
  taskId: 'server-1',
  clientTimestamp: T1,
  attempts: 0,
  previous: task,
};

describe('the task cache in storage', () => {
  it('reads back an empty cache before anything was ever written', () => {
    expect(readTaskCache(createMemoryStorage())).toEqual([]);
  });

  it('round-trips through storage, not through memory', () => {
    const storage = createMemoryStorage();
    writeTaskCache(storage, [task, { ...task, id: 'local-2', isLocalId: true }]);
    expect(readTaskCache(storage)).toEqual([task, { ...task, id: 'local-2', isLocalId: true }]);
  });

  it('survives every reference to the writer being discarded', () => {
    const storage = createMemoryStorage();
    writeTaskCache(storage, [task]);
    const restored = readTaskCache(storage);
    expect(restored[0]?.id).toBe('server-1');
  });

  it('drops a corrupt record and keeps the valid ones', () => {
    const storage = createMemoryStorage();
    storage.set(TASK_CACHE_KEY, JSON.stringify([task, { id: 'server-2' }]));
    expect(readTaskCache(storage).map(entry => entry.id)).toEqual(['server-1']);
  });

  it('reads an empty cache when the stored text is not JSON', () => {
    const storage = createMemoryStorage();
    storage.set(TASK_CACHE_KEY, 'not json at all');
    expect(readTaskCache(storage)).toEqual([]);
  });

  it('reads an empty cache when the stored value is not a list', () => {
    const storage = createMemoryStorage();
    storage.set(TASK_CACHE_KEY, JSON.stringify({ tasks: [task] }));
    expect(readTaskCache(storage)).toEqual([]);
  });
});

describe('the mutation queue in storage', () => {
  it('reads back an empty queue before anything was ever written', () => {
    expect(readMutationQueue(createMemoryStorage())).toEqual([]);
  });

  it('round-trips every kind of entry, in order', () => {
    const storage = createMemoryStorage();
    writeMutationQueue(storage, [createEntry, updateEntry, deleteEntry]);
    expect(readMutationQueue(storage)).toEqual([createEntry, updateEntry, deleteEntry]);
  });

  it('preserves the attempt counter across the round trip', () => {
    const storage = createMemoryStorage();
    writeMutationQueue(storage, [updateEntry]);
    expect(readMutationQueue(storage)[0]?.attempts).toBe(2);
  });

  it('drops an entry of an unknown kind written by some other build', () => {
    const storage = createMemoryStorage();
    storage.set(
      MUTATION_QUEUE_KEY,
      JSON.stringify([createEntry, { ...updateEntry, kind: 'archive' }]),
    );
    expect(readMutationQueue(storage).map(entry => entry.id)).toEqual(['entry-1']);
  });

  it('drops an update that lost its rollback snapshot, which could not be rolled back', () => {
    const storage = createMemoryStorage();
    storage.set(
      MUTATION_QUEUE_KEY,
      JSON.stringify([
        {
          id: 'entry-2',
          kind: 'update',
          taskId: 'server-1',
          clientTimestamp: T1,
          attempts: 0,
          payload: { title: 'Renamed' },
        },
      ]),
    );
    expect(readMutationQueue(storage)).toEqual([]);
  });

  it('drops a create whose draft lost its expiresAt sentinel', () => {
    const storage = createMemoryStorage();
    storage.set(
      MUTATION_QUEUE_KEY,
      JSON.stringify([
        {
          ...createEntry,
          payload: {
            title: 'Ship the queue',
            description: 'Before the code',
            category: 'Work',
            isDone: false,
            createdAt: T1,
          },
        },
      ]),
    );
    expect(readMutationQueue(storage)).toEqual([]);
  });

  it('reads an empty queue when the stored text is not JSON', () => {
    const storage = createMemoryStorage();
    storage.set(MUTATION_QUEUE_KEY, '][');
    expect(readMutationQueue(storage)).toEqual([]);
  });

  it('keeps the cache and the queue under separate keys', () => {
    const storage = createMemoryStorage();
    writeTaskCache(storage, [task]);
    writeMutationQueue(storage, [createEntry]);
    expect(readTaskCache(storage)).toHaveLength(1);
    expect(readMutationQueue(storage)).toHaveLength(1);
  });
});
