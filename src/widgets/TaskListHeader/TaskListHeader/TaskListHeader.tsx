import { strings } from '@lib/strings';
import { AppSearchField, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import { MomentumCard } from '../MomentumCard';
import type { ITaskListHeaderProps } from './ITaskListHeader';
import { makeTaskListHeaderStyles } from './TaskListHeader.styles';

/**
 * Everything above the rows on artboards B1–B5: the momentum card, the
 * block, and the search field.
 *
 * It is one widget rather than three siblings in the screen because the list draws it in two
 * different places — as `ListHeaderComponent` when there are rows, and as a plain block above
 * an empty state when there are not — and the two must not drift apart.
 */
export const TaskListHeader = ({
  summary,
  searchQuery,
  onSearchQueryChange,
  onClearSearchQuery,
  hasSearchField,
}: ITaskListHeaderProps): JSX.Element => {
  const styles = useThemedStyles(makeTaskListHeaderStyles);

  return (
    <AppView style={styles.header}>
      <MomentumCard summary={summary} />

      {hasSearchField ? (
        <AppSearchField
          value={searchQuery}
          onChangeText={onSearchQueryChange}
          onClear={onClearSearchQuery}
          accessibilityLabel={strings.taskList.search.label}
          clearAccessibilityLabel={strings.taskList.search.clear}
          placeholder={strings.taskList.search.placeholder}
          style={styles.searchField}
          testID="taskList.search"
        />
      ) : null}
    </AppView>
  );
};
