import { strings } from '@lib/strings';
import { AppIcon, AppPressable, AppText } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import { makeDeleteTaskActionStyles } from './DeleteTaskAction.styles';
import type { IDeleteTaskActionProps } from './IDeleteTaskAction';

/**
 * "Delete task" — the last thing on artboard B8, and the only irreversible one.
 *
 * It opens the confirmation the list already owns rather than deleting on press; FR-10 puts
 * a modal naming the task in front of every delete, wherever it is triggered from.
 */
export const DeleteTaskAction = ({ onPress, testID }: IDeleteTaskActionProps): JSX.Element => {
  const styles = useThemedStyles(makeDeleteTaskActionStyles);

  return (
    <AppPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={strings.taskDetail.delete}
      style={styles.action}
      testID={testID}
    >
      <AppIcon name="delete" size="size18" color="error" />
      <AppText variant="label" color="error">
        {strings.taskDetail.delete}
      </AppText>
    </AppPressable>
  );
};
