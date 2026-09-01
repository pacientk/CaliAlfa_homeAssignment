import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface DeleteTaskDialogStyles {
  readonly card: ViewStyle;
  readonly message: TextStyle;
  readonly actions: ViewStyle;
  readonly button: ViewStyle;
  readonly buttonCancel: ViewStyle;
  readonly buttonConfirm: ViewStyle;
}

/**
 * Artboard B3: a 320 pt card, radius 24, 24 pt padding, level-2 shadow, with two equal pill
 * buttons 48 pt tall under 24 pt of space.
 *
 * The card stretches inside `AppModal`'s 40 pt gutters rather than declaring a fixed 320
 * width. On the 402 pt frame the canvas is drawn for that resolves to 322, and it is the
 * behaviour that survives a narrower device — where a hard 320 would touch both edges.
 */
export const makeDeleteTaskDialogStyles = (theme: Theme): DeleteTaskDialogStyles =>
  StyleSheet.create({
    card: {
      alignSelf: 'stretch',
      backgroundColor: theme.colors.surface.lowest,
      borderRadius: theme.borderRadius.radius24,
      padding: theme.spacing.space24,
      ...theme.shadows.level2,
    },
    message: {
      marginTop: theme.spacing.space8,
    },
    actions: {
      flexDirection: 'row',
      columnGap: theme.spacing.space12,
      marginTop: theme.spacing.space24,
    },
    button: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: theme.sizes.size48,
      borderRadius: theme.borderRadius.full,
    },
    buttonCancel: {
      backgroundColor: theme.colors.surface.container,
    },
    buttonConfirm: {
      backgroundColor: theme.colors.feedback.error,
    },
  });
