import type { TaskFormValues } from '@features/task-form';
import { categorySuggestions, TaskForm, toTaskDraft } from '@features/task-form';
import { useCreateTask, useTasks } from '@features/task-sync';
import { strings } from '@lib/strings';
import type { JSX } from 'react';

import type { INewTaskScreenProps } from './INewTaskScreen';

/**
 * Artboards B6 and B7.
 *
 * The screen is the seam between the two features the form needs and may not reach across
 * itself: `task-sync` owns the data, `task-form` owns the form, and a feature may not import
 * another feature. So the titles and the categories are read here and handed down, and the
 * submitted values come back up to be written here.
 *
 * `createdAt` is stamped at submit rather than at mount: it is the moment the user wrote the
 * task, which is also what makes an offline create keep its place in a list ordered newest
 * first. The create returns synchronously, so there is nothing to await before leaving.
 */
export const NewTaskScreen = ({ onClose }: INewTaskScreenProps): JSX.Element => {
  const tasks = useTasks();
  const createTask = useCreateTask();

  const submit = (values: TaskFormValues): void => {
    createTask(toTaskDraft(values, new Date().toISOString()));
    onClose();
  };

  return (
    <TaskForm
      screenTitle={strings.newTask.title}
      submitLabel={strings.newTask.submit}
      existingTitles={tasks.map(task => task.title)}
      categorySuggestions={categorySuggestions(tasks)}
      onSubmit={submit}
      onBack={onClose}
    />
  );
};
