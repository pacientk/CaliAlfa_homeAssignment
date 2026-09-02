import type { CountryPrefix } from '@features/auth/lib/countryPrefixes';

export interface ICountryPrefixSheetProps {
  readonly isVisible: boolean;
  /** The entry drawn as chosen. Compared by ISO code, since dial codes are not unique. */
  readonly selectedIso: string;
  readonly onSelect: (prefix: CountryPrefix) => void;
  readonly onRequestClose: () => void;
  readonly testID?: string;
}
