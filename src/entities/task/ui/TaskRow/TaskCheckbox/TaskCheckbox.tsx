import { strings } from '@lib/strings';
import { AppIcon, AppPressable } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';
import type { ViewStyle } from 'react-native';

import type { ITaskCheckboxProps } from './ITaskCheckbox';
import type { TaskCheckboxStyles } from './TaskCheckbox.styles';
import { makeTaskCheckboxStyles } from './TaskCheckbox.styles';

/**
 * Completion beats expiry. A task ticked off before its deadline passed keeps the success
 * fill afterwards (AC-3) — the flat disabled fill is only for a box that is still open and
 * can no longer be ticked.
 */
const resolveFill = (
  styles: TaskCheckboxStyles,
  isDone: boolean,
  isExpired: boolean,
): ViewStyle => {
  if (isDone) {
    return styles.boxChecked;
  }

  return isExpired ? styles.boxExpired : styles.boxUnchecked;
};

/**
 * The task row's checkbox.
 *
 * Disabling is done through `AppPressable`'s own contract rather than by dropping the
 * handler: that is what also sets `accessibilityState.disabled`, so the control announces
 * why nothing happens instead of silently ignoring the tap.
 */
export const TaskCheckbox = ({
  isDone,
  isExpired,
  accessibilityLabel,
  onToggle,
  testID,
}: ITaskCheckboxProps): JSX.Element => {
  const styles = useThemedStyles(makeTaskCheckboxStyles);

  const toggle = (): void => {
    onToggle(!isDone);
  };

  return (
    <AppPressable
      onPress={toggle}
      isDisabled={isExpired}
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={
        isExpired ? strings.taskList.row.expiredHint : strings.taskList.row.toggleDoneHint
      }
      accessibilityState={{ checked: isDone }}
      style={[styles.box, resolveFill(styles, isDone, isExpired)]}
      testID={testID}
    >
      {isDone ? <AppIcon name="check" size="size16" color="onPrimary" /> : null}
    </AppPressable>
  );
};
