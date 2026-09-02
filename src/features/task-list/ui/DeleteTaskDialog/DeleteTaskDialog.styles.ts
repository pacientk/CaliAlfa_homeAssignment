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
 * Artboard B3's confirmation, redrawn as a bottom sheet so the app has one modal shape
 * instead of two.
 *
 * What B3 still governs is the pair of equal pill buttons, 48 pt tall under 24 pt of space.
 * What it no longer governs is the container: the sheet draws the surface, the top corners,
 * the shadow and the header, and the title lives in that header rather than here.
 *
 * The sheet this one opens with is deliberately the un-dismissable variant — no close button
 * and a scrim that does not respond — because a stray tap on the backdrop is not an answer to
 * "delete this permanently?". The shape is shared with the pickers; the cost of the action is
 * not.
 */
export const makeDeleteTaskDialogStyles = (theme: Theme): DeleteTaskDialogStyles =>
  StyleSheet.create({
    // The sheet draws the surface, the corners and the shadow now; what is left here is the
    // body's own inset. The title moved into the sheet's header, so the message no longer
    // needs the 8 pt that separated it from a heading that is no longer its sibling.
    card: {
      paddingHorizontal: theme.spacing.space20,
      paddingTop: theme.spacing.space16,
      // The sheet already clears the safe area; this is the air the buttons need above the
      // home indicator, which lives inside that inset and makes a flush edge read as cramped.
      paddingBottom: theme.spacing.space24,
    },
    message: {},
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
