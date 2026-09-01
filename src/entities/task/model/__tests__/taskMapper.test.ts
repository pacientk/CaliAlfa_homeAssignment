import type { Task, TaskDraft } from '../Task';
import { isTaskWire, toTask, toWireDraft, toWirePatch } from '../taskMapper';
import type { TaskWire } from '../TaskWire';

const fullWire: TaskWire = {
  id: '7',
  title: 'Ship the spec',
  description: 'Write it before the code',
  category: 'Work',
  is_done: true,
  createdAt: '2026-09-01T08:30:00.000Z',
  expiresAt: '2026-09-08T08:30:00.000Z',
};

const minimalWire: TaskWire = {
  id: '8',
  title: 'Buy milk',
  description: '',
  category: '',
  is_done: false,
  createdAt: '2026-09-01T09:00:00.000Z',
};

describe('toTask', () => {
  it('renames is_done to isDone and round-trips every other field', () => {
    expect(toTask(fullWire)).toEqual({
      id: '7',
      title: 'Ship the spec',
      description: 'Write it before the code',
      category: 'Work',
      isDone: true,
      createdAt: '2026-09-01T08:30:00.000Z',
      expiresAt: '2026-09-08T08:30:00.000Z',
    });
  });

  it('carries a false is_done through as false rather than dropping it', () => {
    expect(toTask(minimalWire).isDone).toBe(false);
  });

  it('omits expiresAt entirely when the wire record has none', () => {
    const task = toTask(minimalWire);

    expect('expiresAt' in task).toBe(false);
    expect(task.expiresAt).toBeUndefined();
  });

  it('omits expiresAt when the service returns null or an empty string', () => {
    expect('expiresAt' in toTask({ ...minimalWire, expiresAt: null })).toBe(false);
    expect('expiresAt' in toTask({ ...minimalWire, expiresAt: '' })).toBe(false);
  });

  it('keeps expiresAt when the wire record carries one', () => {
    expect('expiresAt' in toTask(fullWire)).toBe(true);
  });
});

describe('isTaskWire', () => {
  it('accepts a full record and a record without expiresAt', () => {
    expect(isTaskWire(fullWire)).toBe(true);
    expect(isTaskWire(minimalWire)).toBe(true);
  });

  it('accepts a null expiresAt, which the service does return', () => {
    expect(isTaskWire({ ...minimalWire, expiresAt: null })).toBe(true);
  });

  it('accepts a record carrying extra fields the service happens to store', () => {
    expect(isTaskWire({ ...fullWire, avatar: 'https://example.test/a.png' })).toBe(true);
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['a string', 'not a record'],
    ['a number', 42],
  ])('rejects %s', (_label, value) => {
    expect(isTaskWire(value)).toBe(false);
  });

  it.each([
    ['id', { ...fullWire, id: undefined }],
    ['title', { ...fullWire, title: undefined }],
    ['description', { ...fullWire, description: undefined }],
    ['category', { ...fullWire, category: undefined }],
    ['is_done', { ...fullWire, is_done: undefined }],
    ['createdAt', { ...fullWire, createdAt: undefined }],
  ])('rejects a record missing %s', (_field, value) => {
    expect(isTaskWire(value)).toBe(false);
  });

  it.each([
    ['is_done as a string', { ...fullWire, is_done: 'true' }],
    ['id as a number', { ...fullWire, id: 7 }],
    ['expiresAt as a number', { ...fullWire, expiresAt: 1757000000000 }],
  ])('rejects %s', (_label, value) => {
    expect(isTaskWire(value)).toBe(false);
  });
});

describe('toWireDraft', () => {
  const draft: TaskDraft = {
    title: 'Ship the spec',
    description: '',
    category: 'Work',
    isDone: false,
    createdAt: '2026-09-01T08:30:00.000Z',
    expiresAt: null,
  };

  it('always carries createdAt, so the service never invents one', () => {
    expect(toWireDraft(draft).createdAt).toBe('2026-09-01T08:30:00.000Z');
  });

  it('writes isDone out as is_done', () => {
    expect(toWireDraft({ ...draft, isDone: true })).toMatchObject({ is_done: true });
    expect('isDone' in toWireDraft(draft)).toBe(false);
  });

  it('always carries the expiresAt key, so the service never invents an expiry', () => {
    expect('expiresAt' in toWireDraft(draft)).toBe(true);
    expect('expiresAt' in toWireDraft({ ...draft, expiresAt: '2026-09-08T00:00:00.000Z' })).toBe(
      true,
    );
  });

  it('sends null for a task that never expires', () => {
    expect(toWireDraft(draft).expiresAt).toBeNull();
  });

  it('sends the date for a task that does expire', () => {
    expect(toWireDraft({ ...draft, expiresAt: '2026-09-08T00:00:00.000Z' }).expiresAt).toBe(
      '2026-09-08T00:00:00.000Z',
    );
  });

  it('round-trips a null expiry back to a Task with no expiresAt key', () => {
    const wire = toWireDraft(draft);
    const stored = toTask({ ...wire, id: '9' });

    expect('expiresAt' in stored).toBe(false);
  });
});

describe('toWirePatch', () => {
  it('sends only the fields the caller supplied, because PUT merges', () => {
    expect(toWirePatch({ title: 'Renamed' })).toEqual({ title: 'Renamed' });
  });

  it('sends a false isDone as is_done rather than treating it as absent', () => {
    expect(toWirePatch({ isDone: false })).toEqual({ is_done: false });
  });

  it('sends an empty description, which is a real value, not an omission', () => {
    expect(toWirePatch({ description: '' })).toEqual({ description: '' });
  });

  it('produces an empty patch for empty changes', () => {
    expect(toWirePatch({})).toEqual({});
  });

  it('sends an explicit null to clear an expiry', () => {
    expect(toWirePatch({ expiresAt: null })).toEqual({ expiresAt: null });
  });

  it('sends a date to set an expiry', () => {
    expect(toWirePatch({ expiresAt: '2026-09-08T00:00:00.000Z' })).toEqual({
      expiresAt: '2026-09-08T00:00:00.000Z',
    });
  });

  it('omits the expiresAt key entirely when the caller left it alone', () => {
    expect('expiresAt' in toWirePatch({ title: 'Renamed' })).toBe(false);
    expect('expiresAt' in toWirePatch({ expiresAt: undefined })).toBe(false);
  });

  it('maps every supported field at once', () => {
    const task: Task = toTask(fullWire);

    expect(
      toWirePatch({
        title: task.title,
        description: task.description,
        category: task.category,
        isDone: task.isDone,
        expiresAt: task.expiresAt,
      }),
    ).toEqual({
      title: 'Ship the spec',
      description: 'Write it before the code',
      category: 'Work',
      is_done: true,
      expiresAt: '2026-09-08T08:30:00.000Z',
    });
  });
});
