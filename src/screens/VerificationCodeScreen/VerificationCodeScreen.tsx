import {
  authFailureMessage,
  AuthPrimaryButton,
  AuthTopBar,
  OTP_CODE_LENGTH,
  OtpCodeRow,
  useConfirmVerificationCode,
  useResendCountdown,
  useSendVerificationCode,
  useVerificationPhoneNumber,
} from '@features/auth';
import { strings } from '@lib/strings';
import { AppIcon, AppScrollView, AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { IVerificationCodeScreenProps } from './IVerificationCodeScreen';
import { ResendAction } from './ResendAction';
import { makeVerificationCodeScreenStyles } from './VerificationCodeScreen.styles';

/**
 * Artboards A3, A4 and A5 — one screen, three states.
 *
 * Nothing here navigates on success. `confirmCode` resolving means Firebase holds a session,
 * its listener drives the session store, and `RootNavigator` swaps the auth stack for the tab
 * shell; a screen that also pushed a route would be a second answer to the same question.
 *
 * The failure that reddens the row is the *confirmation's* failure alone. A resend that fails
 * still reports itself in the message line, but it says nothing about the digits on screen, so
 * it leaves them in their resting palette.
 */
export const VerificationCodeScreen = ({ onBack }: IVerificationCodeScreenProps): JSX.Element => {
  const styles = useThemedStyles(makeVerificationCodeScreenStyles);
  const insets = useSafeAreaInsets();
  const phoneNumber = useVerificationPhoneNumber();
  const [code, setCode] = useState('');

  const confirmation = useConfirmVerificationCode();
  const resendRequest = useSendVerificationCode();
  const countdown = useResendCountdown();

  const failure = confirmation.failure ?? resendRequest.failure;
  const hasCodeError = confirmation.failure !== undefined;
  const canSubmit = code.length === OTP_CODE_LENGTH && !confirmation.isConfirming;

  // AC-3: the digits stay exactly as they were. Only the error goes, and only once the user
  // has actually changed something — otherwise the message would vanish before it was read.
  const changeCode = (next: string): void => {
    confirmation.clearFailure();
    setCode(next);
  };

  const submitCode = (): void => {
    void confirmation.confirm(code);
  };

  const resendCode = (): void => {
    if (phoneNumber === undefined) {
      return;
    }

    void resendRequest.send(phoneNumber).then(didSend => {
      if (didSend) {
        countdown.restart();
        setCode('');
        confirmation.clearFailure();
      }
    });
  };

  return (
    <AppView style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <AuthTopBar
        onBack={onBack}
        accessibilityLabel={strings.verificationCode.back}
        testID="otp.back"
      />

      <AppScrollView contentContainerStyle={styles.content}>
        <AppView style={[styles.tile, hasCodeError ? styles.tileError : styles.tileResting]}>
          <AppIcon
            name={hasCodeError ? 'sms_failed' : 'sms'}
            size="size28"
            color={hasCodeError ? 'onErrorContainer' : 'accent'}
          />
        </AppView>

        <AppText variant="headline" accessibilityRole="header" style={styles.title}>
          {strings.verificationCode.title}
        </AppText>

        {phoneNumber === undefined ? null : (
          <AppText color="secondary" style={styles.sentTo}>
            {strings.verificationCode.sentTo(phoneNumber)}
          </AppText>
        )}

        <AppView style={styles.codeRow}>
          <OtpCodeRow
            code={code}
            onCodeChange={changeCode}
            hasError={hasCodeError}
            accessibilityLabel={strings.verificationCode.fieldAccessibilityLabel}
            testID="otp.field"
          />
        </AppView>

        {failure === undefined ? null : (
          <AppView style={styles.message}>
            <AppIcon name="error" size="size16" color="error" />
            <AppText
              variant="caption"
              color="onErrorContainer"
              style={styles.messageText}
              accessibilityRole="alert"
              testID="otp.message"
            >
              {authFailureMessage(failure)}
            </AppText>
          </AppView>
        )}

        <ResendAction
          secondsRemaining={countdown.secondsRemaining}
          canResend={countdown.canResend && !resendRequest.isSending}
          onResend={resendCode}
        />

        <AppView style={styles.spacer} />

        <AuthPrimaryButton
          label={strings.verificationCode.submit}
          onPress={submitCode}
          isDisabled={!canSubmit}
          testID="otp.next"
        />
      </AppScrollView>
    </AppView>
  );
};
