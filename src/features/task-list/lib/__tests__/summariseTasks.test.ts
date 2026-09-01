import type { Task } from '@entities/task';

import { summariseTasks } from '../summariseTasks';

const taskOf = (id: string, isDone: boolean, expiresAt?: string): Task => ({
  id,
  title: `Task ${id}`,
  description: '',
  category: 'Work',
  isDone,
  createdAt: '2026-09-01T12:00:00.000Z',
  ...(expiresAt === undefined ? {} : { expiresAt }),
});

const PAST = '2020-01-01T00:00:00.000Z';

describe('summariseTasks', () => {
  it('counts the completed tasks against the whole list', () => {
    const summary = summariseTasks([
      taskOf('1', true),
      taskOf('2', true),
      taskOf('3', false),
      taskOf('4', false),
      taskOf('5', false),
      taskOf('6', false),
    ]);

    expect(summary).toEqual({ completedCount: 2, totalCount: 6, completedRatio: 2 / 6 });
  });

  it('counts an expired task towards both numbers (FR-16)', () => {
    const summary = summariseTasks([taskOf('1', true, PAST), taskOf('2', false, PAST)]);

    expect(summary).toEqual({ completedCount: 1, totalCount: 2, completedRatio: 0.5 });
  });

  it('reports zero rather than NaN for an empty list', () => {
    expect(summariseTasks([])).toEqual({
      completedCount: 0,
      totalCount: 0,
      completedRatio: 0,
    });
  });

  it('reports a full bar only when every task is done', () => {
    expect(summariseTasks([taskOf('1', true)]).completedRatio).toBe(1);
    expect(summariseTasks([taskOf('1', true), taskOf('2', false)]).completedRatio).not.toBe(1);
  });
});
