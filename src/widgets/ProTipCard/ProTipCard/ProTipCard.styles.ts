import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface ProTipCardStyles {
  readonly card: ViewStyle;
  readonly body: TextStyle;
}

/** Artboard B1: a `low` panel under the last row, radius 16, 14 × 16 padding. */
export const makeProTipCardStyles = (theme: Theme): ProTipCardStyles =>
  StyleSheet.create({
    card: {
      // The rows already sit 8 pt apart; the canvas adds another 8 under the last one.
      marginTop: theme.spacing.space8,
      borderRadius: theme.borderRadius.radius16,
      backgroundColor: theme.colors.surface.low,
      paddingVertical: theme.spacing.space14,
      paddingHorizontal: theme.spacing.space16,
    },
    body: {
      marginTop: theme.spacing.space4,
    },
  });
