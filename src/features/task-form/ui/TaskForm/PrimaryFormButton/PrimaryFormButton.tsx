import { AppPressable, AppText } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import type { IPrimaryFormButtonProps } from './IPrimaryFormButton';
import { makePrimaryFormButtonStyles } from './PrimaryFormButton.styles';

/**
 * The form's call to action — "Add task" on B6, "Save changes" on B8, disabled on B7.
 *
 * Disabling goes through `AppPressable`'s own contract rather than by withholding the
 * handler: that is what also sets `accessibilityState.disabled`, so a screen reader says
 * the button is unavailable instead of the user tapping a control that silently does
 * nothing.
 */
export const PrimaryFormButton = ({
  label,
  onPress,
  isDisabled,
  testID,
}: IPrimaryFormButtonProps): JSX.Element => {
  const styles = useThemedStyles(makePrimaryFormButtonStyles);

  return (
    <AppPressable
      onPress={onPress}
      isDisabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.button, isDisabled ? styles.buttonDisabled : styles.buttonEnabled]}
      testID={testID}
    >
      <AppText variant="label" color={isDisabled ? 'tertiary' : 'onPrimary'}>
        {label}
      </AppText>
    </AppPressable>
  );
};
