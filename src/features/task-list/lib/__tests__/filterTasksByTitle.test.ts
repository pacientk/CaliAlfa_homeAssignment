import type { Task } from '@entities/task';

import { filterTasksByTitle } from '../filterTasksByTitle';

const taskOf = (id: string, title: string): Task => ({
  id,
  title,
  description: '',
  category: 'Work',
  isDone: false,
  createdAt: '2026-09-01T12:00:00.000Z',
});

const TASKS: readonly Task[] = [
  taskOf('1', 'Fix Elle Driver'),
  taskOf('2', 'Fix Bill'),
  taskOf('3', 'Book the dentist'),
];

const titlesOf = (tasks: readonly Task[]): string[] => tasks.map(task => task.title);

describe('filterTasksByTitle', () => {
  it('keeps every task whose title contains the query', () => {
    expect(titlesOf(filterTasksByTitle(TASKS, 'Fix'))).toEqual(['Fix Elle Driver', 'Fix Bill']);
  });

  it('matches without regard to case', () => {
    expect(titlesOf(filterTasksByTitle(TASKS, 'fIx bIlL'))).toEqual(['Fix Bill']);
  });

  it('matches in the middle of a title, not only at its start', () => {
    expect(titlesOf(filterTasksByTitle(TASKS, 'dentist'))).toEqual(['Book the dentist']);
  });

  it('drops every task when nothing matches', () => {
    expect(filterTasksByTitle(TASKS, 'passport')).toEqual([]);
  });

  it('ignores whitespace the user has not finished typing around', () => {
    expect(titlesOf(filterTasksByTitle(TASKS, '  Bill  '))).toEqual(['Fix Bill']);
  });

  it('returns the very same array — not a copy — when there is nothing to filter by', () => {
    // A new array identity on every keystroke is a re-render the recycling list does not need.
    expect(filterTasksByTitle(TASKS, '')).toBe(TASKS);
    expect(filterTasksByTitle(TASKS, '   ')).toBe(TASKS);
  });

  it('searches the title and nothing else', () => {
    const withCategory = [taskOf('4', 'Renew the pass'), taskOf('5', 'Something else')];

    expect(titlesOf(filterTasksByTitle(withCategory, 'Work'))).toEqual([]);
  });
});
