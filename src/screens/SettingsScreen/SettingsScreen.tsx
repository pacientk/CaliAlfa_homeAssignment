import { signOut } from '@features/auth';
import { strings } from '@lib/strings';
import { PlaceholderScreen } from '@widgets/PlaceholderScreen';
import type { JSX } from 'react';

/**
 * Placeholder for artboard C2. T-012 replaces the body.
 *
 * Signing out is here rather than deferred because it is the only way to walk back to the
 * auth stack on a device, which is what makes AC-1 and AC-2 verifiable by hand.
 */
export const SettingsScreen = (): JSX.Element => (
  <PlaceholderScreen
    title={strings.settings.title}
    subtitle={strings.settings.subtitle}
    actions={[{ label: strings.settings.signOut, onPress: signOut }]}
  />
);
