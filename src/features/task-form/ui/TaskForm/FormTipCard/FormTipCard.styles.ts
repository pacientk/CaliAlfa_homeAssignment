import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface FormTipCardStyles {
  readonly card: ViewStyle;
  readonly body: TextStyle;
}

/** Artboard B6: a `low` panel, radius 16, 12 × 14 padding, 24 pt below the last field. */
export const makeFormTipCardStyles = (theme: Theme): FormTipCardStyles =>
  StyleSheet.create({
    card: {
      marginTop: theme.spacing.space24,
      borderRadius: theme.borderRadius.radius16,
      backgroundColor: theme.colors.surface.low,
      paddingVertical: theme.spacing.space12,
      paddingHorizontal: theme.spacing.space14,
    },
    body: {
      marginTop: theme.spacing.space2,
    },
  });
