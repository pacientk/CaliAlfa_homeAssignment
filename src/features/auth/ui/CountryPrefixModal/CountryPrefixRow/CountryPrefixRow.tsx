import { AppIcon, AppPressable, AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import { makeCountryPrefixModalStyles } from '../CountryPrefixModal.styles';
import type { ICountryPrefixRowProps } from './ICountryPrefixRow';

/**
 * One country in the picker.
 *
 * Its accessibility role is `menuitem` with a checked state rather than `button`, because
 * that is what it is: one of a set, one of which is currently chosen. A screen reader then
 * says which one is selected without the label having to spell it out.
 */
export const CountryPrefixRow = ({
  prefix,
  isSelected,
  hasDivider,
  onSelect,
}: ICountryPrefixRowProps): JSX.Element => {
  const styles = useThemedStyles(makeCountryPrefixModalStyles);

  const select = (): void => {
    onSelect(prefix);
  };

  return (
    <AppPressable
      onPress={select}
      accessibilityRole="menuitem"
      accessibilityLabel={`${prefix.country} ${prefix.dialCode}`}
      accessibilityState={{ checked: isSelected }}
      style={[
        styles.row,
        hasDivider ? styles.rowDivider : undefined,
        isSelected ? styles.rowSelected : undefined,
      ]}
      testID={`phoneNumber.prefixOption.${prefix.iso}`}
    >
      <AppText variant="body" style={styles.country}>
        {prefix.country}
      </AppText>

      <AppText
        variant="bodyStrong"
        color={isSelected ? 'accent' : 'secondary'}
        style={styles.dialCode}
      >
        {prefix.dialCode}
      </AppText>

      <AppView style={styles.check}>
        {isSelected ? <AppIcon name="check" size="size20" color="accent" /> : null}
      </AppView>
    </AppPressable>
  );
};
