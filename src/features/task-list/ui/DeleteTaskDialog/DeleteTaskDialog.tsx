import { strings } from '@lib/strings';
import { AppModal, AppPressable, AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import { makeDeleteTaskDialogStyles } from './DeleteTaskDialog.styles';
import type { IDeleteTaskDialogProps } from './IDeleteTaskDialog';

/**
 * FR-10: delete asks first, and the question names the task.
 *
 * The copy is built from the title rather than from a row index or an id, because the modal
 * is presented over a scrim that hides which row was tapped — the sentence is the only thing
 * left telling the user what they are about to lose.
 */
export const DeleteTaskDialog = ({
  isVisible,
  taskTitle,
  onCancel,
  onConfirm,
}: IDeleteTaskDialogProps): JSX.Element => {
  const styles = useThemedStyles(makeDeleteTaskDialogStyles);

  return (
    <AppModal
      isVisible={isVisible}
      onRequestClose={onCancel}
      accessibilityLabel={strings.taskList.deleteDialog.title}
      testID="taskList.deleteDialog"
    >
      <AppView style={styles.card}>
        <AppText variant="title" accessibilityRole="header">
          {strings.taskList.deleteDialog.title}
        </AppText>

        <AppText variant="body" color="secondary" style={styles.message}>
          {strings.taskList.deleteDialog.message(taskTitle)}
        </AppText>

        <AppView style={styles.actions}>
          <AppPressable
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel={strings.taskList.deleteDialog.cancel}
            style={[styles.button, styles.buttonCancel]}
            testID="taskList.deleteDialog.cancel"
          >
            <AppText variant="label">{strings.taskList.deleteDialog.cancel}</AppText>
          </AppPressable>

          <AppPressable
            onPress={onConfirm}
            accessibilityRole="button"
            accessibilityLabel={strings.taskList.deleteDialog.confirm}
            style={[styles.button, styles.buttonConfirm]}
            testID="taskList.deleteDialog.confirm"
          >
            <AppText variant="label" color="onPrimary">
              {strings.taskList.deleteDialog.confirm}
            </AppText>
          </AppPressable>
        </AppView>
      </AppView>
    </AppModal>
  );
};
