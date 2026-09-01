import type { Task } from '@entities/task';
import { isTaskExpired } from '@entities/task';

import type { TaskFormValues } from '../TaskFormValues';
import {
  emptyTaskFormValues,
  taskFormValuesOf,
  toTaskChanges,
  toTaskDraft,
} from '../TaskFormValues';

const CREATED_AT = '2026-03-12T09:14:00.000Z';
const EXPIRES_AT = '2026-03-18T18:00:00.000Z';
const NOW = '2026-03-20T00:00:00.000Z';

const taskOf = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  title: 'Fix Elle Driver',
  description: 'Call back about the swordsmith invoice before Friday.',
  category: 'In Progress',
  isDone: false,
  createdAt: CREATED_AT,
  ...overrides,
});

const valuesOf = (overrides: Partial<TaskFormValues> = {}): TaskFormValues => ({
  ...emptyTaskFormValues(),
  title: 'Find a bell',
  ...overrides,
});

describe('emptyTaskFormValues (FR-7)', () => {
  it('starts a create empty, not done, and with no expiry', () => {
    expect(emptyTaskFormValues()).toEqual({
      title: '',
      description: '',
      category: '',
      isDone: false,
      expiresAt: null,
    });
  });

  it('hands out a fresh object, so two open forms cannot share one', () => {
    expect(emptyTaskFormValues()).not.toBe(emptyTaskFormValues());
  });
});

describe('taskFormValuesOf (AC-3)', () => {
  it('prefills every field from the record', () => {
    expect(taskFormValuesOf(taskOf({ isDone: true, expiresAt: EXPIRES_AT }))).toEqual({
      title: 'Fix Elle Driver',
      description: 'Call back about the swordsmith invoice before Friday.',
      category: 'In Progress',
      isDone: true,
      expiresAt: EXPIRES_AT,
    });
  });

  it('renders an absent expiry as empty rather than as a default date', () => {
    expect(taskFormValuesOf(taskOf()).expiresAt).toBeNull();
  });
});

describe('toTaskDraft', () => {
  it('always states the expiry, because an omitted one is invented by the service', () => {
    const draft = toTaskDraft(valuesOf(), CREATED_AT);

    expect('expiresAt' in draft).toBe(true);
    expect(draft.expiresAt).toBeNull();
  });

  it('carries a chosen expiry through unchanged', () => {
    expect(toTaskDraft(valuesOf({ expiresAt: EXPIRES_AT }), CREATED_AT).expiresAt).toBe(EXPIRES_AT);
  });

  it('stamps the moment it is given rather than reading a clock of its own', () => {
    expect(toTaskDraft(valuesOf(), CREATED_AT).createdAt).toBe(CREATED_AT);
  });

  it('does not trim the title on the user’s behalf', () => {
    expect(toTaskDraft(valuesOf({ title: ' Find a bell ' }), CREATED_AT).title).toBe(
      ' Find a bell ',
    );
  });
});

describe('toTaskChanges (AC-5)', () => {
  it('sends null for a cleared expiry, which is what clears the stored one', () => {
    expect(toTaskChanges(valuesOf({ expiresAt: null })).expiresAt).toBeNull();
  });

  it('sends the moment for an expiry that is set', () => {
    expect(toTaskChanges(valuesOf({ expiresAt: EXPIRES_AT })).expiresAt).toBe(EXPIRES_AT);
  });

  it('never omits the expiry, which would leave the stored one alone', () => {
    expect('expiresAt' in toTaskChanges(valuesOf())).toBe(true);
  });

  it('states all five fields, so a merge cannot keep a value the form has replaced', () => {
    expect(Object.keys(toTaskChanges(valuesOf())).sort()).toEqual([
      'category',
      'description',
      'expiresAt',
      'isDone',
      'title',
    ]);
  });
});

describe('a cleared expiry leaves a task that is not expired (AC-5)', () => {
  it('is expired while the past moment is stored, and not once the form clears it', () => {
    const expired = taskOf({ expiresAt: EXPIRES_AT });

    expect(isTaskExpired(expired, NOW)).toBe(true);

    const cleared = toTaskChanges({ ...taskFormValuesOf(expired), expiresAt: null });

    expect(isTaskExpired({ expiresAt: cleared.expiresAt ?? undefined }, NOW)).toBe(false);
  });
});
