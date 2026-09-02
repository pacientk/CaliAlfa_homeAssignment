/**
 * The country prefixes the phone field offers.
 *
 * Deliberately a short, hand-picked list rather than the full ITU table. Two hundred and
 * forty rows would need a search field, a flag asset set and a scroll position to be usable,
 * and none of that is what this screen is for. Fifteen covers the countries this app is
 * plausibly signed into from, and the field still accepts any number the provider accepts —
 * the picker chooses a prefix, it does not restrict the world.
 *
 * `+972` leads the list and is the default because the project's Firebase test number is
 * Israeli: a reviewer opening this screen can type the national digits and go, rather than
 * hunting for the country first. `+34` is second because it is the number the design draws.
 */
export interface CountryPrefix {
  /** ISO 3166-1 alpha-2, used as the stable key — dial codes are not unique across countries. */
  readonly iso: string;
  readonly country: string;
  /** The dial code with its leading plus, exactly as it is spelled into E.164. */
  readonly dialCode: string;
}

export const COUNTRY_PREFIXES: readonly CountryPrefix[] = [
  { iso: 'IL', country: 'Israel', dialCode: '+972' },
  { iso: 'ES', country: 'Spain', dialCode: '+34' },
  { iso: 'US', country: 'United States', dialCode: '+1' },
  { iso: 'GB', country: 'United Kingdom', dialCode: '+44' },
  { iso: 'DE', country: 'Germany', dialCode: '+49' },
  { iso: 'FR', country: 'France', dialCode: '+33' },
  { iso: 'IT', country: 'Italy', dialCode: '+39' },
  { iso: 'NL', country: 'Netherlands', dialCode: '+31' },
  { iso: 'PT', country: 'Portugal', dialCode: '+351' },
  { iso: 'PL', country: 'Poland', dialCode: '+48' },
  { iso: 'UA', country: 'Ukraine', dialCode: '+380' },
  { iso: 'TR', country: 'Türkiye', dialCode: '+90' },
  { iso: 'AE', country: 'United Arab Emirates', dialCode: '+971' },
  { iso: 'IN', country: 'India', dialCode: '+91' },
  { iso: 'AU', country: 'Australia', dialCode: '+61' },
] as const;

/**
 * The prefix the field starts on.
 *
 * A non-null assertion would be the obvious way to read the first entry, and it is banned —
 * so the default is named directly. The test below asserts it is in the list, which is the
 * property that actually matters.
 */
export const DEFAULT_COUNTRY_PREFIX: CountryPrefix = {
  iso: 'IL',
  country: 'Israel',
  dialCode: '+972',
};
