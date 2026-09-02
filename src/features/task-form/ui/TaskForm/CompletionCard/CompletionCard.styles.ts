import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface CompletionCardStyles {
  readonly card: ViewStyle;
  readonly label: TextStyle;
  readonly track: ViewStyle;
  readonly trackOn: ViewStyle;
  readonly trackOff: ViewStyle;
  readonly knob: ViewStyle;
}

/**
 * Artboard B8's "Mark as completed" row: a level-1 card, 14 × 16 padding, radius 16, holding
 * the label and a 48 × 28 switch with a 24 pt knob inset by 2.
 *
 * The artboard also draws a checkbox at the head of the row. It is gone: two drawings of one
 * boolean, side by side, read as two controls that might disagree. The switch is what the
 * design uses for a setting, and the checkbox is what a task row uses — there it is the whole
 * affordance rather than a second picture of one.
 */
export const makeCompletionCardStyles = (theme: Theme): CompletionCardStyles =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: theme.spacing.space12,
      backgroundColor: theme.colors.surface.lowest,
      borderRadius: theme.borderRadius.radius16,
      paddingVertical: theme.spacing.space14,
      paddingHorizontal: theme.spacing.space16,
      ...theme.shadows.level1,
    },
    label: {
      flex: 1,
    },
    track: {
      width: theme.sizes.size48,
      minHeight: theme.sizes.size28,
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.space2,
      borderRadius: theme.borderRadius.full,
    },
    trackOn: {
      backgroundColor: theme.colors.primary.base,
      justifyContent: 'flex-end',
    },
    trackOff: {
      backgroundColor: theme.colors.surface.containerHighest,
      justifyContent: 'flex-start',
    },
    knob: {
      width: theme.sizes.size24,
      height: theme.sizes.size24,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.surface.lowest,
      ...theme.shadows.level1,
    },
  });
