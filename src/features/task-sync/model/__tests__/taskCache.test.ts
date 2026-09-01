import type { Task } from '@entities/task/model';

import type { CachedTask } from '../CachedTask';
import {
  applyChanges,
  findTask,
  mergeIntoCache,
  mergeServerList,
  removeTask,
  replaceLocalId,
  upsertTask,
} from '../taskCache';

const T1 = '2026-09-01T12:00:01.000Z';
const T2 = '2026-09-01T12:00:02.000Z';
const T3 = '2026-09-01T12:00:03.000Z';

const cached = (overrides: Partial<CachedTask> = {}): CachedTask => ({
  id: 'server-1',
  title: 'Original',
  description: 'Description',
  category: 'Work',
  isDone: false,
  createdAt: T1,
  isLocalId: false,
  lastLocalWriteAt: T1,
  ...overrides,
});

const server = (overrides: Partial<Task> = {}): Task => ({
  id: 'server-1',
  title: 'Server title',
  description: 'Description',
  category: 'Work',
  isDone: false,
  createdAt: T1,
  ...overrides,
});

describe('findTask, upsertTask, removeTask', () => {
  it('finds a task by id', () => {
    expect(findTask([cached(), cached({ id: 'server-2' })], 'server-2')?.id).toBe('server-2');
  });

  it('returns undefined for an id the cache does not hold', () => {
    expect(findTask([cached()], 'server-9')).toBeUndefined();
  });

  it('replaces an existing record in place rather than duplicating it', () => {
    const updated = upsertTask([cached(), cached({ id: 'server-2' })], cached({ title: 'New' }));
    expect(updated).toHaveLength(2);
    expect(findTask(updated, 'server-1')?.title).toBe('New');
  });

  it('appends a record the cache does not hold yet', () => {
    const updated = upsertTask([cached()], cached({ id: 'server-2' }));
    expect(updated.map(task => task.id)).toEqual(['server-1', 'server-2']);
  });

  it('removes only the named record', () => {
    const updated = removeTask([cached(), cached({ id: 'server-2' })], 'server-1');
    expect(updated.map(task => task.id)).toEqual(['server-2']);
  });

  it('leaves the cache alone when the id is not present', () => {
    expect(removeTask([cached()], 'server-9')).toHaveLength(1);
  });
});

describe('applyChanges — the optimistic edit, including the three states of expiresAt', () => {
  it('overwrites only the fields the change carries', () => {
    const updated = applyChanges(cached(), { title: 'Renamed' }, T2);
    expect(updated.title).toBe('Renamed');
    expect(updated.description).toBe('Description');
  });

  it('stamps the moment of the local write', () => {
    expect(applyChanges(cached(), { isDone: true }, T2).lastLocalWriteAt).toBe(T2);
  });

  it('leaves an existing expiry alone when expiresAt is absent from the change', () => {
    const updated = applyChanges(cached({ expiresAt: T3 }), { title: 'Renamed' }, T2);
    expect(updated.expiresAt).toBe(T3);
  });

  it('clears the expiry when the change carries an explicit null', () => {
    const updated = applyChanges(cached({ expiresAt: T3 }), { expiresAt: null }, T2);
    expect('expiresAt' in updated).toBe(false);
  });

  it('sets the expiry when the change carries a string', () => {
    expect(applyChanges(cached(), { expiresAt: T3 }, T2).expiresAt).toBe(T3);
  });

  it('does not mutate the record it was given', () => {
    const original = cached();
    applyChanges(original, { title: 'Renamed' }, T2);
    expect(original.title).toBe('Original');
  });
});

describe('replaceLocalId — what makes a task created offline stop being local', () => {
  it('swaps the local id for the server id', () => {
    const updated = replaceLocalId(
      [cached({ id: 'local-1', isLocalId: true })],
      'local-1',
      server(),
      T1,
    );
    expect(updated.map(task => task.id)).toEqual(['server-1']);
    expect(updated[0]?.isLocalId).toBe(false);
  });

  it('keeps a local edit made after the create was queued', () => {
    const local = cached({
      id: 'local-1',
      isLocalId: true,
      title: 'Renamed',
      lastLocalWriteAt: T2,
    });
    const updated = replaceLocalId([local], 'local-1', server(), T1);
    expect(updated[0]?.title).toBe('Renamed');
    expect(updated[0]?.id).toBe('server-1');
  });

  it('adopts the server record when nothing was written locally since the create', () => {
    const local = cached({
      id: 'local-1',
      isLocalId: true,
      title: 'Renamed',
      lastLocalWriteAt: T1,
    });
    expect(replaceLocalId([local], 'local-1', server(), T1)[0]?.title).toBe('Server title');
  });

  it('adds the server record when the local copy has already been deleted', () => {
    expect(replaceLocalId([], 'local-1', server(), T1)).toHaveLength(0);
  });
});

describe('mergeIntoCache — one server record landing in the cache', () => {
  it('adds a record the cache does not hold', () => {
    expect(mergeIntoCache([], server(), T1)).toHaveLength(1);
  });

  it('lets a newer local write survive the merge', () => {
    const local = cached({ title: 'Renamed', lastLocalWriteAt: T3 });
    expect(mergeIntoCache([local], server(), T2)[0]?.title).toBe('Renamed');
  });

  it('lets the server record win over an older local write', () => {
    const local = cached({ title: 'Renamed', lastLocalWriteAt: T1 });
    expect(mergeIntoCache([local], server(), T2)[0]?.title).toBe('Server title');
  });
});

describe('mergeServerList — the first sync', () => {
  it('takes the whole server list into an empty cache', () => {
    const merged = mergeServerList([], [server(), server({ id: 'server-2' })], T2, new Set());
    expect(merged.map(task => task.id).sort()).toEqual(['server-1', 'server-2']);
  });

  it('drops a synced local record the server no longer has', () => {
    const merged = mergeServerList([cached({ id: 'server-9' })], [server()], T2, new Set());
    expect(findTask(merged, 'server-9')).toBeUndefined();
  });

  it('keeps a task created offline, which the server cannot know about yet', () => {
    const local = cached({ id: 'local-1', isLocalId: true });
    expect(findTask(mergeServerList([local], [server()], T2, new Set()), 'local-1')).toBeDefined();
  });

  it('protects a record with an unsynced change from being overwritten by the server', () => {
    const local = cached({ title: 'Renamed', lastLocalWriteAt: T1 });
    const merged = mergeServerList([local], [server()], T2, new Set(['server-1']));
    expect(findTask(merged, 'server-1')?.title).toBe('Renamed');
  });

  it('does not resurrect a record whose delete is still queued', () => {
    const merged = mergeServerList([], [server()], T2, new Set(['server-1']));
    expect(findTask(merged, 'server-1')).toBeUndefined();
  });

  it('overwrites an unprotected record with the server version', () => {
    const local = cached({ title: 'Stale', lastLocalWriteAt: T1 });
    expect(findTask(mergeServerList([local], [server()], T2, new Set()), 'server-1')?.title).toBe(
      'Server title',
    );
  });
});
