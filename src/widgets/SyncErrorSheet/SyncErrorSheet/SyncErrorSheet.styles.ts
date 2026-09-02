import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface SyncErrorSheetStyles {
  readonly card: ViewStyle;
  readonly message: TextStyle;
  readonly button: ViewStyle;
  readonly buttonDisabled: ViewStyle;
}

/**
 * The same body inset as the delete sheet, for the same reasons: the sheet draws the
 * surface, the corners, the shadow and the header, and what is left here is the air around
 * the body and the space the buttons need above the home indicator.
 *
 * One button rather than the delete sheet's pair. There is no second action to offer — the
 * ways out of a `picker` sheet are its close control and its scrim, and adding a "not now"
 * beside them would be a third spelling of the same thing.
 */
export const makeSyncErrorSheetStyles = (theme: Theme): SyncErrorSheetStyles =>
  StyleSheet.create({
    card: {
      paddingHorizontal: theme.spacing.space20,
      paddingTop: theme.spacing.space16,
      paddingBottom: theme.spacing.space24,
    },
    message: {},
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: theme.sizes.size48,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary.base,
      marginTop: theme.spacing.space24,
    },
    // Dimmed rather than swapped for a spinner: the label already says "Trying…", and a
    // button that keeps its size and place cannot make the sheet jump while it waits.
    buttonDisabled: {
      backgroundColor: theme.colors.primary.muted,
    },
  });
