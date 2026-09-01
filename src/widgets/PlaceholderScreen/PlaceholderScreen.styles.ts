import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface PlaceholderScreenStyles {
  readonly screen: ViewStyle;
  readonly text: TextStyle;
  readonly action: ViewStyle;
}

/**
 * Deliberately plain. This widget is scaffolding, not a design surface — every real screen
 * that replaces it brings its own layout from the canvas. What it does honour is the rules
 * that outlive it: token-only values, and `minHeight` rather than `height` on the button so
 * the label still fits when the OS text size grows.
 */
export const makePlaceholderScreenStyles = (theme: Theme): PlaceholderScreenStyles =>
  StyleSheet.create({
    screen: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.screen,
      paddingHorizontal: theme.spacing.space20,
      rowGap: theme.spacing.space16,
    },
    text: {
      textAlign: 'center',
    },
    action: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: theme.sizes.size52,
      paddingHorizontal: theme.spacing.space22,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary.base,
    },
  });
