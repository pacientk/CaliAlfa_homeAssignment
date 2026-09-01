/**
 * Creating and editing a task.
 *
 * The copy is split by area so that work on different screens does not contend on a
 * single file. `./index.ts` composes the areas back into one frozen `strings` object,
 * which is what every component reads.
 */

export const newTask = {
  title: 'New task',
  subtitle: 'The task form lands here.',
  close: 'Back to the list',
} as const;

export const taskDetail = {
  title: 'Task detail',
  close: 'Back to the list',
} as const;
