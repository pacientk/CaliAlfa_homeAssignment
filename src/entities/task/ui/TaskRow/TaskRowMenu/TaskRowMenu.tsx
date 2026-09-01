import { strings } from '@lib/strings';
import { AppIcon, AppPressable, AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import type { ITaskRowMenuProps } from './ITaskRowMenu';
import { makeTaskRowMenuStyles } from './TaskRowMenu.styles';

/**
 * Edit and Delete, revealed beneath the card (FR-9). There is no long-press gesture in this
 * app: the three-dot button is the only way in, which is also the only way that is
 * discoverable with a screen reader.
 */
export const TaskRowMenu = ({ onEdit, onDelete, testID }: ITaskRowMenuProps): JSX.Element => {
  const styles = useThemedStyles(makeTaskRowMenuStyles);

  return (
    <AppView style={styles.menu} testID={testID}>
      <AppPressable
        onPress={onEdit}
        accessibilityRole="menuitem"
        accessibilityLabel={strings.taskList.row.edit}
        style={styles.item}
      >
        <AppIcon name="edit" size="size20" color="accent" />
        <AppText variant="label">{strings.taskList.row.edit}</AppText>
      </AppPressable>

      <AppView style={styles.divider} />

      <AppPressable
        onPress={onDelete}
        accessibilityRole="menuitem"
        accessibilityLabel={strings.taskList.row.delete}
        style={styles.item}
      >
        <AppIcon name="delete" size="size20" color="error" />
        <AppText variant="label" color="error">
          {strings.taskList.row.delete}
        </AppText>
      </AppPressable>
    </AppView>
  );
};
