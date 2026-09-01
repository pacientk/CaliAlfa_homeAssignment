import { signIn } from '@features/auth';
import { strings } from '@lib/strings';
import { PlaceholderScreen } from '@widgets/PlaceholderScreen';
import type { JSX } from 'react';

/**
 * Placeholder for artboards A3–A5. T-008 replaces the body.
 *
 * It takes no navigation callback because accepting a code does not push a route: it sets the
 * session, and `RootNavigator` swaps the whole stack in response. That is the same seam the
 * real Firebase flow will use.
 */
export const VerificationCodeScreen = (): JSX.Element => (
  <PlaceholderScreen
    title={strings.verificationCode.title}
    subtitle={strings.verificationCode.subtitle}
    actions={[{ label: strings.verificationCode.submit, onPress: signIn }]}
  />
);
