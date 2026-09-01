import { strings } from '@lib/strings';
import { PlaceholderScreen } from '@widgets/PlaceholderScreen';
import type { JSX } from 'react';

import type { IWelcomeScreenProps } from './IWelcomeScreen';

/** Placeholder for artboard A1. T-008 replaces the body. */
export const WelcomeScreen = ({ onContinue }: IWelcomeScreenProps): JSX.Element => (
  <PlaceholderScreen
    title={strings.welcome.title}
    subtitle={strings.welcome.subtitle}
    actions={[{ label: strings.welcome.continue, onPress: onContinue }]}
  />
);
