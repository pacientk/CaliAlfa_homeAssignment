import type { Theme } from '@ui/tokens';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface AppScrollViewStyles {
  readonly screenPadding: ViewStyle;
}

/**
 * The 20 pt horizontal screen margin the design draws on every artboard
 * (`Tech Assignment/design/… § "20 pt horizontal margin"`). It is horizontal padding, so it
 * is a structural value and stays raw when the OS text size grows —
 * `docs/architecture/principles.md § Sizing`.
 */
export const makeAppScrollViewStyles = (theme: Theme): AppScrollViewStyles =>
  StyleSheet.create({
    screenPadding: { paddingHorizontal: theme.spacing.space20 },
  });
