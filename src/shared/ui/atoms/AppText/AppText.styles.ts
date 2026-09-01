import type { Theme } from '@ui/tokens';
import type { TextStyle } from 'react-native';
import { StyleSheet } from 'react-native';

import type { TextColorRole, TextVariant } from './IAppText';

export interface AppTextStyles {
  readonly variant: Record<TextVariant, TextStyle>;
  readonly color: Record<TextColorRole, TextStyle>;
}

/**
 * Two registered lookups rather than one style per variant-and-colour pairing: the variant
 * and the colour are independent choices, so building the fifteen-by-eight cross product
 * would register 120 styles in order to use two of them.
 *
 * `theme.typography` is handed to `StyleSheet.create` unchanged — the variants are already
 * complete text styles, and re-listing them here would be exactly the duplication the token
 * layer exists to prevent.
 */
export const makeAppTextStyles = (theme: Theme): AppTextStyles => ({
  variant: StyleSheet.create({ ...theme.typography }),
  color: StyleSheet.create({
    primary: { color: theme.colors.text.primary },
    secondary: { color: theme.colors.text.secondary },
    tertiary: { color: theme.colors.text.tertiary },
    accent: { color: theme.colors.text.accent },
    onPrimary: { color: theme.colors.text.onPrimary },
    onPrimaryContainer: { color: theme.colors.text.onPrimaryContainer },
    error: { color: theme.colors.text.error },
    onErrorContainer: { color: theme.colors.text.onErrorContainer },
  }),
});
