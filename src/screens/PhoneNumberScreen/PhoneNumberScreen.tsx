import { strings } from '@lib/strings';
import { PlaceholderScreen } from '@widgets/PlaceholderScreen';
import type { JSX } from 'react';

import type { IPhoneNumberScreenProps } from './IPhoneNumberScreen';

/** Placeholder for artboard A2. T-008 replaces the body. */
export const PhoneNumberScreen = ({ onSubmit }: IPhoneNumberScreenProps): JSX.Element => (
  <PlaceholderScreen
    title={strings.phoneNumber.title}
    subtitle={strings.phoneNumber.subtitle}
    actions={[{ label: strings.phoneNumber.submit, onPress: onSubmit }]}
  />
);
