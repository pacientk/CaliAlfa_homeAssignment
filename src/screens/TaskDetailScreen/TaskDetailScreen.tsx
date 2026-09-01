import type { TaskFormValues } from '@features/task-form';
import { categorySuggestions, TaskForm, toTaskChanges } from '@features/task-form';
import { DeleteTaskDialog } from '@features/task-list';
import { useDeleteTask, useTask, useTasks, useUpdateTask } from '@features/task-sync';
import { strings } from '@lib/strings';
import { AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';
import { useState } from 'react';

import type { ITaskDetailScreenProps } from './ITaskDetailScreen';
import { makeTaskDetailScreenStyles } from './TaskDetailScreen.styles';

/**
 * Artboard B8.
 *
 * Delete goes through the list's own confirmation rather than a second one of its own:
 * FR-10 puts a modal naming the task in front of every delete, and two dialogs asking the
 * same question is how they end up wording it differently.
 *
 * A task that is not in the cache renders as an empty screen for the one frame between
 * confirming a delete and the navigator unwinding. Guarding on the record rather than on a
 * flag is what makes that frame safe without a second piece of state that could disagree
 * with the cache.
 */
export const TaskDetailScreen = ({ taskId, onClose }: ITaskDetailScreenProps): JSX.Element => {
  const styles = useThemedStyles(makeTaskDetailScreenStyles);
  const tasks = useTasks();
  const task = useTask(taskId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [isDeleteRequested, setIsDeleteRequested] = useState(false);

  const submit = (values: TaskFormValues): void => {
    updateTask(taskId, toTaskChanges(values));
    onClose();
  };

  const confirmDelete = (): void => {
    setIsDeleteRequested(false);
    deleteTask(taskId);
    onClose();
  };

  if (task === undefined) {
    return <AppView style={styles.screen} testID="taskDetail.missing" />;
  }

  return (
    <AppView style={styles.screen}>
      <TaskForm
        screenTitle={strings.taskDetail.title}
        submitLabel={strings.taskDetail.submit}
        editedTask={task}
        existingTitles={tasks.map(candidate => candidate.title)}
        categorySuggestions={categorySuggestions(tasks)}
        onSubmit={submit}
        onBack={onClose}
        onDelete={() => {
          setIsDeleteRequested(true);
        }}
      />

      <DeleteTaskDialog
        isVisible={isDeleteRequested}
        taskTitle={task.title}
        onCancel={() => {
          setIsDeleteRequested(false);
        }}
        onConfirm={confirmDelete}
      />
    </AppView>
  );
};
