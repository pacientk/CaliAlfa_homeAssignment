import type { Theme } from '@ui/tokens';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface DeleteTaskActionStyles {
  readonly action: ViewStyle;
}

/**
 * Artboard B8: a 44 pt text action 12 pt below the primary button, with no fill of its own.
 *
 * Destructive and unfilled is the point — the design gives the safe action the weight and
 * leaves the irreversible one as text, so the two cannot be confused at a glance.
 */
export const makeDeleteTaskActionStyles = (theme: Theme): DeleteTaskActionStyles =>
  StyleSheet.create({
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      columnGap: theme.spacing.space8,
      minHeight: theme.sizes.size44,
      marginTop: theme.spacing.space12,
    },
  });
