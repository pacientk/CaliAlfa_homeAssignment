import { strings } from '@lib/strings';
import { AppIcon, AppPressable, AppText } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import type { INewTaskButtonProps } from './INewTaskButton';
import { makeNewTaskButtonStyles } from './NewTaskButton.styles';

/**
 * The floating "New task" pill from artboards B1, B2 and B5.
 *
 * It is a labelled pill rather than a round icon button because that is what the canvas
 * draws, and because a glyph-only FAB is the control screen-reader users most often meet
 * unlabelled — here the label is on screen and is the accessibility label.
 */
export const NewTaskButton = ({ onPress, style }: INewTaskButtonProps): JSX.Element => {
  const styles = useThemedStyles(makeNewTaskButtonStyles);

  return (
    <AppPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={strings.taskList.createTask}
      style={[styles.button, style]}
      testID="taskList.newTask"
    >
      <AppIcon name="add" size="size20" color="onPrimary" />
      <AppText variant="label" color="onPrimary">
        {strings.taskList.createTask}
      </AppText>
    </AppPressable>
  );
};
