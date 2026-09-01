import { isTaskExpired, TaskRow } from '@entities/task';
import {
  DeleteTaskDialog,
  NewTaskButton,
  summariseTasks,
  useExpiryNow,
  useTaskRowMenu,
  useTaskSearch,
} from '@features/task-list';
import type { CachedTask } from '@features/task-sync';
import { useDeleteTask, useTasks, useToggleTaskDone } from '@features/task-sync';
import { strings } from '@lib/strings';
import type { ListRenderItemInfo } from '@shopify/flash-list';
import { AppFlashList, AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import { EmptyState } from '@widgets/EmptyState';
import { ProTipCard } from '@widgets/ProTipCard';
import { SyncBanner } from '@widgets/SyncBanner';
import { TaskListHeader } from '@widgets/TaskListHeader';
import type { JSX } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ITaskListScreenProps } from './ITaskListScreen';
import { makeTaskListScreenStyles } from './TaskListScreen.styles';

const keyExtractor = (task: CachedTask): string => task.id;

/**
 * Artboards B1–B5.
 *
 * Ordering is `useTasks`' business, not this screen's: the list renders the cache in the
 * order it arrives, newest first, and completing a task changes a field rather than a
 * position — which is FR-6, and the reason a row never jumps out from under a finger.
 *
 * The screen takes intent callbacks rather than a navigator. `docs/architecture/conventions.md`
 * puts navigation *above* screens, so route names live in the tab wrapper and this file only
 * knows that a task can be created and a task can be opened.
 */
export const TaskListScreen = ({ onCreateTask, onOpenTask }: ITaskListScreenProps): JSX.Element => {
  const styles = useThemedStyles(makeTaskListScreenStyles);
  const insets = useSafeAreaInsets();

  const tasks = useTasks();
  const toggleTaskDone = useToggleTaskDone();
  const deleteTask = useDeleteTask();

  const expiryNow = useExpiryNow();
  const search = useTaskSearch(tasks);
  const menu = useTaskRowMenu();
  const summary = summariseTasks(tasks);

  const hasTasks = tasks.length > 0;
  const hasVisibleTasks = search.visibleTasks.length > 0;
  const taskPendingDeletion = menu.taskPendingDeletion;

  // Everything a recycled row reads that is not on the row's own item, as one primitive.
  const rowsRevision = `${expiryNow}|${menu.openMenuTaskId ?? ''}`;

  const confirmDelete = (): void => {
    if (taskPendingDeletion === undefined) {
      return;
    }

    deleteTask(taskPendingDeletion.id);
    menu.dismissDelete();
  };

  const renderTask = ({ item }: ListRenderItemInfo<CachedTask>): JSX.Element => (
    <AppView style={styles.rowSlot}>
      <TaskRow
        task={item}
        isExpired={isTaskExpired(item, expiryNow)}
        isMenuOpen={menu.openMenuTaskId === item.id}
        onToggleDone={(isDone: boolean) => {
          toggleTaskDone(item.id, isDone);
        }}
        onToggleMenu={() => {
          menu.toggleMenu(item.id);
        }}
        onEdit={() => {
          menu.closeMenu();
          onOpenTask(item.id);
        }}
        onDelete={() => {
          menu.requestDelete(item);
        }}
        testID={`taskList.row.${item.id}`}
      />
    </AppView>
  );

  const header = (
    <TaskListHeader
      summary={summary}
      searchQuery={search.query}
      onSearchQueryChange={search.setQuery}
      onClearSearchQuery={search.clearQuery}
      hasSearchField={hasTasks}
      hasFocusModeBlock={hasVisibleTasks}
    />
  );

  return (
    <AppView style={[styles.screen, { paddingTop: insets.top }]}>
      <AppView style={styles.header}>
        <AppText
          variant="title"
          color="accent"
          accessibilityRole="header"
          style={styles.headerTitle}
        >
          {strings.taskList.title}
        </AppText>
      </AppView>

      <SyncBanner />

      <AppView style={styles.content}>
        {hasVisibleTasks ? (
          <AppFlashList
            data={search.visibleTasks}
            renderItem={renderTask}
            keyExtractor={keyExtractor}
            ListHeaderComponent={header}
            ListFooterComponent={<ProTipCard />}
            contentContainerStyle={styles.listContent}
            extraData={rowsRevision}
            testID="taskList.list"
          />
        ) : (
          <AppView style={styles.emptyLayout}>
            {header}
            {hasTasks ? (
              <EmptyState
                icon="search_off"
                tone="neutral"
                title={strings.taskList.noResults.title(search.settledQuery)}
                message={strings.taskList.noResults.message(search.hiddenCount)}
                actionLabel={strings.taskList.search.clear}
                onAction={search.clearQuery}
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
            )}
          </AppView>
        )}
      </AppView>

      {hasTasks ? <NewTaskButton onPress={onCreateTask} style={styles.newTask} /> : null}

      <DeleteTaskDialog
        isVisible={taskPendingDeletion !== undefined}
        taskTitle={taskPendingDeletion?.title ?? ''}
        onCancel={menu.dismissDelete}
        onConfirm={confirmDelete}
      />
    </AppView>
  );
};
