import type { CountryPrefix } from '@features/auth/lib/countryPrefixes';
import { COUNTRY_PREFIXES } from '@features/auth/lib/countryPrefixes';
import { strings } from '@lib/strings';
import { AppModal, AppScrollView, AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import { makeCountryPrefixModalStyles } from './CountryPrefixModal.styles';
import { CountryPrefixRow } from './CountryPrefixRow';
import type { ICountryPrefixModalProps } from './ICountryPrefixModal';

/**
 * The country picker.
 *
 * The canvas draws the prefix as a dropdown with a chevron, which is a desktop control: iOS
 * has no dropdown, and the platform's answer to "choose one of a short list" is a presented
 * sheet. So the chevron stays — it is what tells the user the segment is choosable — and the
 * thing it opens is a modal, which is also the only way to cover the tab bar.
 *
 * Selecting a row both applies the choice and closes the modal. A picker with a separate
 * confirm button asks the user to say the same thing twice.
 */
export const CountryPrefixModal = ({
  isVisible,
  selectedIso,
  onSelect,
  onRequestClose,
  testID,
}: ICountryPrefixModalProps): JSX.Element => {
  const styles = useThemedStyles(makeCountryPrefixModalStyles);

  return (
    <AppModal
      isVisible={isVisible}
      onRequestClose={onRequestClose}
      accessibilityLabel={strings.phoneNumber.prefixModal.title}
      testID={testID}
    >
      <AppView style={styles.card}>
        <AppText variant="label" color="secondary" style={styles.title} accessibilityRole="header">
          {strings.phoneNumber.prefixModal.title}
        </AppText>

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
      </AppView>
    </AppModal>
  );
};
