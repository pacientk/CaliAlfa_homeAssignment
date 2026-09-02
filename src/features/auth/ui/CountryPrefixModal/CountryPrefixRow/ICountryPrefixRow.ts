import type { CountryPrefix } from '@features/auth/lib/countryPrefixes';

export interface ICountryPrefixRowProps {
  readonly prefix: CountryPrefix;
  readonly isSelected: boolean;
  /** Every row but the first draws a hairline above it, so the list has no trailing rule. */
  readonly hasDivider: boolean;
  readonly onSelect: (prefix: CountryPrefix) => void;
}
