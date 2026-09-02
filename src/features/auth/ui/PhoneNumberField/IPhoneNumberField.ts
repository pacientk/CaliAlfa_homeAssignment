import type { CountryPrefix } from '@features/auth/lib/countryPrefixes';
import type { StyleProp, ViewStyle } from 'react-native';

export interface IPhoneNumberFieldProps {
  readonly prefix: CountryPrefix;
  readonly onPrefixChange: (next: CountryPrefix) => void;
  /** The national part only. The prefix is never in here. */
  readonly nationalNumber: string;
  readonly onNationalNumberChange: (next: string) => void;
  readonly label: string;
  readonly placeholder?: string;
  readonly errorMessage?: string;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}
