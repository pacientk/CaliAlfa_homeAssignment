import { formatCountdown } from '@features/auth';
import { strings } from '@lib/strings';
import { AppPressable, AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import type { IResendActionProps } from './IResendAction';
import { makeResendActionStyles } from './ResendAction.styles';

/**
 * The resend slot, in its two drawn states — AC-4.
 *
 * The countdown is rendered as text rather than as a disabled button on purpose: there is no
 * control to press for the first minute, so announcing one would promise something the screen
 * cannot deliver. The action appears when it becomes real.
 */
export const ResendAction = ({
  secondsRemaining,
  canResend,
  onResend,
}: IResendActionProps): JSX.Element => {
  const styles = useThemedStyles(makeResendActionStyles);

  if (!canResend) {
    return (
      <AppText variant="bodySmall" color="tertiary" style={styles.waiting} testID="otp.countdown">
        {strings.verificationCode.resendIn(formatCountdown(secondsRemaining))}
      </AppText>
    );
  }

  return (
    <AppView style={styles.offer}>
      <AppText variant="bodySmall" color="secondary">
        {strings.verificationCode.resendPrompt}
      </AppText>
      <AppPressable
        onPress={onResend}
        accessibilityRole="button"
        accessibilityLabel={strings.verificationCode.resend}
        testID="otp.resend"
      >
        <AppText variant="labelPlain" color="accent">
          {strings.verificationCode.resend}
        </AppText>
      </AppPressable>
    </AppView>
  );
};
