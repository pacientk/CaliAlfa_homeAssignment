import { AppPressable, AppText } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import { makeFormChipStyles } from './FormChip.styles';
import type { IFormChipProps } from './IFormChip';

/**
 * One value on offer — a category on the form, a day or a time in the expiry picker.
 *
 * The role is `checkbox` rather than `button` because that is what the control is: a chip
 * that is either chosen or not. A `button` role would announce it as "Work" with no way to
 * hear whether it is on.
 */
export const FormChip = ({ label, isSelected, onPress, testID }: IFormChipProps): JSX.Element => {
  const styles = useThemedStyles(makeFormChipStyles);

  return (
    <AppPressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: isSelected }}
      style={[styles.chip, isSelected ? styles.chipSelected : styles.chipUnselected]}
      testID={testID}
    >
      <AppText variant="captionMedium" color={isSelected ? 'onPrimary' : 'secondary'}>
        {label}
      </AppText>
    </AppPressable>
  );
};
