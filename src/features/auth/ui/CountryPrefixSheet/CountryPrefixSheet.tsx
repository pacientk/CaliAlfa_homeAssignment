import type { CountryPrefix } from '@features/auth/lib/countryPrefixes';
import { COUNTRY_PREFIXES } from '@features/auth/lib/countryPrefixes';
import { strings } from '@lib/strings';
import { AppBottomSheet, AppScrollView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import { CountryPrefixRow } from './CountryPrefixRow';
import { makeCountryPrefixSheetStyles } from './CountryPrefixSheet.styles';
import type { ICountryPrefixSheetProps } from './ICountryPrefixSheet';

/**
 * Artboard A6 — the country picker.
 *
 * The canvas draws the prefix as a dropdown with a chevron, which is a desktop control. iOS has
 * no dropdown, and the platform's answer to "choose one of a short list" is a sheet from the
 * bottom edge: reachable one-handed on an 874 pt frame, and unmistakably a different gesture
 * from the centred card the app uses to confirm a deletion.
 *
 * Selecting a row applies the choice and closes the sheet. A picker with a separate confirm
 * button asks the user to say the same thing twice.
 */
export const CountryPrefixSheet = ({
  isVisible,
  selectedIso,
  onSelect,
  onRequestClose,
  testID,
}: ICountryPrefixSheetProps): JSX.Element => {
  const styles = useThemedStyles(makeCountryPrefixSheetStyles);

  return (
    <AppBottomSheet
      isVisible={isVisible}
      onRequestClose={onRequestClose}
      title={strings.phoneNumber.prefixSheet.title}
      closeLabel={strings.phoneNumber.prefixSheet.close}
      accessibilityLabel={strings.phoneNumber.prefixSheet.title}
      testID={testID}
    >
      <AppScrollView style={styles.list}>
        {COUNTRY_PREFIXES.map((prefix: CountryPrefix, index: number) => (
          <CountryPrefixRow
            key={prefix.iso}
            prefix={prefix}
            isSelected={prefix.iso === selectedIso}
            hasDivider={index > 0}
            onSelect={onSelect}
          />
        ))}
      </AppScrollView>
    </AppBottomSheet>
  );
};
