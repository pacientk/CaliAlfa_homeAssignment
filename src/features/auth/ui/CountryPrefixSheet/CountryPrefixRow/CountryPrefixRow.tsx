import { AppIcon, AppPressable, AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import { makeCountryPrefixSheetStyles } from '../CountryPrefixSheet.styles';
import type { ICountryPrefixRowProps } from './ICountryPrefixRow';

/**
 * One country in the picker: an ISO column, the name, the dial code, and the tick.
 *
 * The ISO code stands in for a flag. It is free, it needs no asset set and no fallback for the
 * codes a system font will not draw, and it gives the eye a fixed left edge to scan down —
 * which is most of what a flag column is actually for in a list this short.
 *
 * The name truncates rather than wraps, so every row stays 52 tall and the seven-row window
 * holds exactly seven.
 *
 * Its role is `menuitem` with a checked state rather than `button`, because that is what it is:
 * one of a set, one of which is currently chosen.
 */
export const CountryPrefixRow = ({
  prefix,
  isSelected,
  hasDivider,
  onSelect,
}: ICountryPrefixRowProps): JSX.Element => {
  const styles = useThemedStyles(makeCountryPrefixSheetStyles);

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
      <AppText variant="overline" color={isSelected ? 'accent' : 'tertiary'} style={styles.iso}>
        {prefix.iso}
      </AppText>

      <AppText variant="body" numberOfLines={1} style={styles.country}>
        {prefix.country}
      </AppText>

      <AppText variant="bodyStrong" color={isSelected ? 'accent' : 'secondary'}>
        {prefix.dialCode}
      </AppText>

      <AppView style={styles.check}>
        {isSelected ? <AppIcon name="check" size="size20" color="accent" /> : null}
      </AppView>
    </AppPressable>
  );
};
