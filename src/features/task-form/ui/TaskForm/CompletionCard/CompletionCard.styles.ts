import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface CompletionCardStyles {
  readonly card: ViewStyle;
  readonly box: ViewStyle;
  readonly boxChecked: ViewStyle;
  readonly boxUnchecked: ViewStyle;
  readonly label: TextStyle;
  readonly track: ViewStyle;
  readonly trackOn: ViewStyle;
  readonly trackOff: ViewStyle;
  readonly knob: ViewStyle;
}

/** The box edge is 2 pt in every state, exactly as sheet D draws the row checkbox. */
const BOX_BORDER_WIDTH = 2;

/**
 * Artboard B8's "Mark as completed" row: a level-1 card, 14 × 16 padding, radius 16, holding
 * a 20 pt box, the label, and a 48 × 28 switch with a 24 pt knob inset by 2.
 *
 * The box is drawn here rather than composed from `entities/task`'s `TaskCheckbox` because
 * that component *is* a pressable — nesting it inside this card would put two competing
 * touch targets and two accessibility roles on one row. Here the box is the switch's
 * illustration, and the row is the control.
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
    box: {
      width: theme.sizes.size20,
      height: theme.sizes.size20,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.radius8,
      borderWidth: BOX_BORDER_WIDTH,
    },
    boxChecked: {
      backgroundColor: theme.colors.feedback.success,
      borderColor: theme.colors.feedback.success,
    },
    boxUnchecked: {
      backgroundColor: theme.colors.surface.lowest,
      borderColor: theme.colors.border.base,
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
