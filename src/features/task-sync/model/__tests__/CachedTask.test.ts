import type { Task } from '@entities/task/model';

import type { CachedTask } from '../CachedTask';
import { isCachedTask, mergeServerRecord, toCachedTask } from '../CachedTask';

const EARLIER = '2026-09-01T12:00:00.000Z';
const LATER = '2026-09-01T12:00:05.000Z';

const serverTask: Task = {
  id: 'server-1',
  title: 'Server title',
  description: 'From the server',
  category: 'Work',
  isDone: false,
  createdAt: EARLIER,
};

const localCopy: CachedTask = {
  id: 'local-1',
  title: 'Local title',
  description: 'Typed on the device',
  category: 'Home',
  isDone: true,
  createdAt: EARLIER,
  isLocalId: true,
  lastLocalWriteAt: EARLIER,
};

describe('toCachedTask', () => {
  it('marks an adopted server record as no longer carrying a local id', () => {
    expect(toCachedTask(serverTask, LATER)).toEqual({
      ...serverTask,
      isLocalId: false,
      lastLocalWriteAt: LATER,
    });
  });

  it('keeps "never expires" as an absent key rather than an explicit undefined', () => {
    expect('expiresAt' in toCachedTask(serverTask, LATER)).toBe(false);
  });
});

describe('mergeServerRecord — last-write-wins, in both directions', () => {
  it('adopts the server record when there is no local copy', () => {
    expect(mergeServerRecord(undefined, serverTask, LATER)).toEqual({
      ...serverTask,
      isLocalId: false,
      lastLocalWriteAt: LATER,
    });
  });

  it('lets the server win when the local write is older', () => {
    const merged = mergeServerRecord(
      { ...localCopy, lastLocalWriteAt: EARLIER },
      serverTask,
      LATER,
    );
    expect(merged.title).toBe('Server title');
    expect(merged.lastLocalWriteAt).toBe(LATER);
  });

  it('lets the local copy win when its write is newer', () => {
    const merged = mergeServerRecord(
      { ...localCopy, lastLocalWriteAt: LATER },
      serverTask,
      EARLIER,
    );
    expect(merged.title).toBe('Local title');
    expect(merged.lastLocalWriteAt).toBe(LATER);
  });

  it('gives the server a tie, because a tie means no local write followed the observation', () => {
    const merged = mergeServerRecord({ ...localCopy, lastLocalWriteAt: LATER }, serverTask, LATER);
    expect(merged.title).toBe('Server title');
  });

  it('adopts the server id even when the local copy wins — that is id reconciliation', () => {
    const merged = mergeServerRecord(
      { ...localCopy, lastLocalWriteAt: LATER },
      serverTask,
      EARLIER,
    );
    expect(merged.id).toBe('server-1');
    expect(merged.isLocalId).toBe(false);
  });

  it('drops a local expiry when the winning server record has none', () => {
    const withExpiry: CachedTask = { ...localCopy, expiresAt: LATER, lastLocalWriteAt: EARLIER };
    expect('expiresAt' in mergeServerRecord(withExpiry, serverTask, LATER)).toBe(false);
  });
});

describe('isCachedTask — persisted records are untrusted input', () => {
  it('accepts a complete record', () => {
    expect(isCachedTask(localCopy)).toBe(true);
  });

  it('accepts a record with an expiry', () => {
    expect(isCachedTask({ ...localCopy, expiresAt: LATER })).toBe(true);
  });

  it('rejects a record missing the local bookkeeping a pre-queue build would not have written', () => {
    expect(isCachedTask(serverTask)).toBe(false);
  });

  it('rejects a record whose isDone drifted to a string', () => {
    expect(isCachedTask({ ...localCopy, isDone: 'true' })).toBe(false);
  });

  it('rejects a record whose expiresAt is null rather than absent', () => {
    expect(isCachedTask({ ...localCopy, expiresAt: null })).toBe(false);
  });

  it('rejects a non-object', () => {
    expect(isCachedTask('not a task')).toBe(false);
    expect(isCachedTask(null)).toBe(false);
  });
});
