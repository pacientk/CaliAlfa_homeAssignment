import { strings } from '@lib/strings';
import type { TextColorRole } from '@ui/atoms';
import { AppIcon, AppPressable, AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { TaskCategoryChip } from '../TaskCategoryChip';
import { TaskCheckbox } from '../TaskCheckbox';
import { TaskRowMenu } from '../TaskRowMenu';
import type { ITaskRowProps } from './ITaskRow';
import type { TaskRowStyles } from './TaskRow.styles';
import { makeTaskRowStyles } from './TaskRow.styles';

/**
 * The card fill and the brand outline are independent: the outline is drawn *over* whichever
 * fill the underlying state chose, which is why the menu variant is appended rather than
 * substituted.
 */
const resolveCard = (
  styles: TaskRowStyles,
  isExpired: boolean,
  isMenuOpen: boolean,
): StyleProp<ViewStyle> => [
  styles.card,
  isExpired ? styles.cardExpired : styles.cardDefault,
  isMenuOpen ? styles.cardMenuOpen : null,
];

/** Completion wins over expiry, so an expired-completed row reads as completed (AC-3). */
const resolveTitleColor = (isDone: boolean, isExpired: boolean): TextColorRole => {
  if (isDone) {
    return 'secondary';
  }

  return isExpired ? 'tertiary' : 'primary';
};

const resolveTitleStyle = (styles: TaskRowStyles, isDone: boolean): StyleProp<TextStyle> =>
  isDone ? [styles.title, styles.titleCompleted] : styles.title;

/**
 * Used when the caller does not name the row. Every part of the row derives its own id from
 * it, so a test — or an end-to-end flow — addresses the card, the checkbox and the menu of a
 * given task without the row having to publish a ref.
 */
const DEFAULT_TEST_ID = 'taskRow';

/**
 * One task, in all five states the component sheet draws. The card and its action menu share
 * a column so the menu pushes the rest of the list down rather than floating over it.
 */
export const TaskRow = ({
  task,
  isExpired,
  isMenuOpen,
  onToggleDone,
  onToggleMenu,
  onEdit,
  onDelete,
  testID = DEFAULT_TEST_ID,
}: ITaskRowProps): JSX.Element => {
  const styles = useThemedStyles(makeTaskRowStyles);

  return (
    <AppView testID={testID}>
      <AppView style={resolveCard(styles, isExpired, isMenuOpen)} testID={`${testID}.card`}>
        <TaskCheckbox
          isDone={task.isDone}
          isExpired={isExpired}
          accessibilityLabel={strings.taskList.row.toggleDone(task.title)}
          onToggle={onToggleDone}
          testID={`${testID}.checkbox`}
        />

        <AppText
          variant="body"
          color={resolveTitleColor(task.isDone, isExpired)}
          numberOfLines={1}
          style={resolveTitleStyle(styles, task.isDone)}
          testID={`${testID}.title`}
        >
          {task.title}
        </AppText>

        <TaskCategoryChip
          category={task.category}
          isExpired={isExpired}
          testID={`${testID}.chip`}
        />

        <AppPressable
          onPress={onToggleMenu}
          accessibilityRole="button"
          accessibilityLabel={strings.taskList.row.actions(task.title)}
          accessibilityState={{ expanded: isMenuOpen }}
          style={[styles.actions, isMenuOpen ? styles.actionsMenuOpen : null]}
          testID={`${testID}.actions`}
        >
          <AppIcon name="more_vert" size="size20" color={isMenuOpen ? 'accent' : 'tertiary'} />
        </AppPressable>
      </AppView>

      {isMenuOpen ? (
        <TaskRowMenu onEdit={onEdit} onDelete={onDelete} testID={`${testID}.menu`} />
      ) : null}
    </AppView>
  );
};
