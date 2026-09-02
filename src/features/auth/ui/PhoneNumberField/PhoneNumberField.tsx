import type { CountryPrefix } from '@features/auth/lib/countryPrefixes';
import { strings } from '@lib/strings';
import { AppIcon, AppPressable, AppText, AppTextInput, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';
import { useState } from 'react';

import { CountryPrefixModal } from '../CountryPrefixModal';
import type { IPhoneNumberFieldProps } from './IPhoneNumberField';
import { makePhoneNumberFieldStyles } from './PhoneNumberField.styles';

/**
 * Artboard A2's phone field: a country segment, a hairline, and the national number, inside
 * one frame.
 *
 * The country is a separate value rather than something parsed back out of the typed string.
 * Parsing would be guesswork — `+1` and `+1` are two countries, and a number typed with no
 * prefix has no country at all — whereas a chosen prefix is a fact the field already knows.
 * The composed E.164 is therefore always well formed, which is what removed the old screen's
 * need to insist on a leading plus.
 *
 * The frame owns focus and error styling because it owns the border; the input inside is
 * seamless and reports its focus outward.
 */
export const PhoneNumberField = ({
  prefix,
  onPrefixChange,
  nationalNumber,
  onNationalNumberChange,
  label,
  placeholder,
  errorMessage,
  style,
  testID,
}: IPhoneNumberFieldProps): JSX.Element => {
  const styles = useThemedStyles(makePhoneNumberFieldStyles);
  const [isFocused, setIsFocused] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const hasError = errorMessage !== undefined && errorMessage.length > 0;
  const frameState = hasError
    ? styles.frameError
    : isFocused
      ? styles.frameFocused
      : styles.frameResting;

  const openPicker = (): void => {
    setIsPickerOpen(true);
  };

  const closePicker = (): void => {
    setIsPickerOpen(false);
  };

  const choosePrefix = (next: CountryPrefix): void => {
    onPrefixChange(next);
    setIsPickerOpen(false);
  };

  return (
    <AppView style={[styles.container, style]}>
      <AppText variant="label" color="secondary" style={styles.label}>
        {label}
      </AppText>

      <AppView style={[styles.frame, frameState]}>
        <AppPressable
          onPress={openPicker}
          accessibilityRole="button"
          accessibilityLabel={`${strings.phoneNumber.prefixAccessibilityLabel} ${prefix.dialCode}`}
          style={styles.prefix}
          testID="phoneNumber.prefix"
        >
          <AppText variant="body">{prefix.dialCode}</AppText>
          <AppIcon name="expand_more" size="size20" color="secondary" />
        </AppPressable>

        <AppView style={styles.divider} />

        <AppTextInput
          value={nationalNumber}
          onChangeText={onNationalNumberChange}
          accessibilityLabel={strings.phoneNumber.fieldAccessibilityLabel}
          placeholder={placeholder}
          keyboardType="phone-pad"
          isSeamless
          onFocusChange={setIsFocused}
          style={styles.input}
          testID={testID}
        />
      </AppView>

      {hasError ? (
        <AppView style={styles.message}>
          <AppIcon name="error" size="size16" color="error" />
          <AppText
            variant="caption"
            color="onErrorContainer"
            style={styles.messageText}
            accessibilityRole="alert"
            accessibilityLabel={errorMessage}
          >
            {errorMessage}
          </AppText>
        </AppView>
      ) : null}

      <CountryPrefixModal
        isVisible={isPickerOpen}
        selectedIso={prefix.iso}
        onSelect={choosePrefix}
        onRequestClose={closePicker}
        testID="phoneNumber.prefixModal"
      />
    </AppView>
  );
};
