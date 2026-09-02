import { strings } from '@lib/strings';
import { EmptyState } from '@widgets/EmptyState';
import type { JSX } from 'react';

import type { ITaskListEmptyProps } from './ITaskListEmpty';

/**
 * Which nothing the list is showing.
 *
 * "No tasks yet" and "nothing matched that search" are the same shape and different
 * situations, and the design draws them differently on purpose: the first is an invitation
 * with a brand tile and a filled action, the second a neutral report with an outline one that
 * gets the user back. Keeping the choice in one component means the screen asks a question
 * rather than carrying both answers.
 *
 * It is a widget rather than part of the task-list feature because it composes `EmptyState`,
 * which is one — a feature importing a widget is the boundary rule's one-way street run
 * backwards, and lint says so.
 */
export const TaskListEmpty = ({
  hasTasks,
  query,
  hiddenCount,
  onClearSearch,
  onCreateTask,
}: ITaskListEmptyProps): JSX.Element =>
  hasTasks ? (
    <EmptyState
      icon="search_off"
      tone="neutral"
      title={strings.taskList.noResults.title(query)}
      message={strings.taskList.noResults.message(hiddenCount)}
      actionLabel={strings.taskList.search.clear}
      onAction={onClearSearch}
      isCentred={false}
      testID="taskList.noResults"
    />
  ) : (
    <EmptyState
      icon="checklist"
      tone="brand"
      title={strings.taskList.noTasks.title}
      message={strings.taskList.noTasks.message}
      actionLabel={strings.taskList.createTask}
      actionIcon="add"
      onAction={onCreateTask}
      isCentred
      testID="taskList.noTasks"
    />
  );
