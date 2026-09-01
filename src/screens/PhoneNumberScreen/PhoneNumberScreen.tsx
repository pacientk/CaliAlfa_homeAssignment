import {
  authFailureMessage,
  AuthPrimaryButton,
  AuthTopBar,
  isPlausiblePhoneNumber,
  sanitisePhoneInput,
  useSendVerificationCode,
} from '@features/auth';
import { strings } from '@lib/strings';
import { AppIcon, AppScrollView, AppText, AppTextInput, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { IPhoneNumberScreenProps } from './IPhoneNumberScreen';
import { makePhoneNumberScreenStyles } from './PhoneNumberScreen.styles';

/**
 * Artboard A2.
 *
 * One field holds the country code and the national number together, as T-008's scope
 * specifies, rather than the canvas's two-part control: a prefix segment is a country picker,
 * and a country picker is a screen this app does not have. The leading `+` in the placeholder
 * is what carries that requirement to the user.
 *
 * The button is gated on plausibility, never on validity. `lib/phoneNumber.ts` says why: the
 * provider is the authority on whether a number can receive an SMS, and a local rule that
 * disagrees with it refuses to send to real numbers.
 */
export const PhoneNumberScreen = ({ onBack, onCodeSent }: IPhoneNumberScreenProps): JSX.Element => {
  const styles = useThemedStyles(makePhoneNumberScreenStyles);
  const insets = useSafeAreaInsets();
  const [enteredNumber, setEnteredNumber] = useState('');
  const { send, failure, isSending } = useSendVerificationCode();

  const canSubmit = isPlausiblePhoneNumber(enteredNumber) && !isSending;

  const changeNumber = (next: string): void => {
    setEnteredNumber(sanitisePhoneInput(next));
  };

  const requestCode = (): void => {
    void send(enteredNumber).then(didSend => {
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

        <AppTextInput
          value={enteredNumber}
          onChangeText={changeNumber}
          label={strings.phoneNumber.fieldLabel}
          accessibilityLabel={strings.phoneNumber.fieldAccessibilityLabel}
          placeholder={strings.phoneNumber.fieldPlaceholder}
          keyboardType="phone-pad"
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
