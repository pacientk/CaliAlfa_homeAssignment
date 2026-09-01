import { strings } from '@lib/strings';
import { PlaceholderScreen } from '@widgets/PlaceholderScreen';
import type { JSX } from 'react';

import type { ITaskListScreenProps } from './ITaskListScreen';

/**
 * Placeholder for artboards B1–B5. T-009 replaces the body.
 *
 * The id below is a stand-in for the row the user would have tapped: it exists so the detail
 * route's parameter is exercised end to end before any task data does.
 */
const PLACEHOLDER_TASK_ID = 'placeholder-task';

export const TaskListScreen = ({ onCreateTask, onOpenTask }: ITaskListScreenProps): JSX.Element => {
  const openPlaceholderTask = (): void => {
    onOpenTask(PLACEHOLDER_TASK_ID);
  };

  return (
    <PlaceholderScreen
      title={strings.taskList.title}
      subtitle={strings.taskList.subtitle}
      actions={[
        { label: strings.taskList.createTask, onPress: onCreateTask },
        { label: strings.taskList.openTask, onPress: openPlaceholderTask },
      ]}
    />
  );
};
