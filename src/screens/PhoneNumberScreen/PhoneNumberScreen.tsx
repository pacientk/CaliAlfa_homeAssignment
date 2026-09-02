import type { CountryPrefix } from '@features/auth';
import {
  authFailureMessage,
  AuthPrimaryButton,
  AuthTopBar,
  composeE164,
  DEFAULT_COUNTRY_PREFIX,
  isPlausibleNumberParts,
  PhoneNumberField,
  sanitiseNationalNumber,
  useSendVerificationCode,
} from '@features/auth';
import { strings } from '@lib/strings';
import { AppIcon, AppScrollView, AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { IPhoneNumberScreenProps } from './IPhoneNumberScreen';
import { makePhoneNumberScreenStyles } from './PhoneNumberScreen.styles';

/**
 * Artboard A2.
 *
 * The field is the canvas's two-part control: a country segment and the national number in
 * one frame. The segment opens a modal rather than a dropdown, because iOS has no dropdown —
 * the chevron the canvas draws is what says the segment is choosable, and a presented sheet
 * is what the platform opens when it is pressed.
 *
 * Holding the country as a value rather than parsing it back out of the typed string is what
 * lets the composed number always be well formed, and is why the screen no longer has to
 * insist the user type the leading plus themselves.
 *
 * The button is gated on plausibility, never on validity. `lib/phoneNumber.ts` says why: the
 * provider is the authority on whether a number can receive an SMS, and a local rule that
 * disagrees with it refuses to send to real numbers.
 */
export const PhoneNumberScreen = ({ onBack, onCodeSent }: IPhoneNumberScreenProps): JSX.Element => {
  const styles = useThemedStyles(makePhoneNumberScreenStyles);
  const insets = useSafeAreaInsets();
  const [prefix, setPrefix] = useState<CountryPrefix>(DEFAULT_COUNTRY_PREFIX);
  const [nationalNumber, setNationalNumber] = useState('');
  const { send, failure, isSending } = useSendVerificationCode();

  const canSubmit = isPlausibleNumberParts(prefix.dialCode, nationalNumber) && !isSending;

  const changeNumber = (next: string): void => {
    setNationalNumber(sanitiseNationalNumber(next));
  };

  const requestCode = (): void => {
    void send(composeE164(prefix.dialCode, nationalNumber)).then(didSend => {
      if (didSend) {
        onCodeSent();
      }
    });
  };

  return (
    <AppView style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <AuthTopBar
        onBack={onBack}
        accessibilityLabel={strings.phoneNumber.back}
        testID="phoneNumber.back"
      />

      <AppScrollView contentContainerStyle={styles.content}>
        <AppText variant="headline" accessibilityRole="header">
          {strings.phoneNumber.title}
        </AppText>

        <AppText color="secondary" style={styles.subtitle}>
          {strings.phoneNumber.subtitle}
        </AppText>

        <PhoneNumberField
          prefix={prefix}
          onPrefixChange={setPrefix}
          nationalNumber={nationalNumber}
          onNationalNumberChange={changeNumber}
          label={strings.phoneNumber.fieldLabel}
          placeholder={strings.phoneNumber.fieldPlaceholder}
          errorMessage={failure === undefined ? undefined : authFailureMessage(failure)}
          style={styles.field}
          testID="phoneNumber.field"
        />

        <AppView style={styles.reassurance}>
          <AppIcon name="lock" size="size16" color="tertiary" />
          <AppText variant="caption" color="tertiary" style={styles.reassuranceText}>
            {strings.phoneNumber.reassurance}
          </AppText>
        </AppView>

        <AppView style={styles.spacer} />

        <AuthPrimaryButton
          label={strings.phoneNumber.submit}
          onPress={requestCode}
          isDisabled={!canSubmit}
          testID="phoneNumber.next"
        />
      </AppScrollView>
    </AppView>
  );
};
