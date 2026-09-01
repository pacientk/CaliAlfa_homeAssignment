import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface PhoneNumberScreenStyles {
  readonly screen: ViewStyle;
  readonly content: ViewStyle;
  readonly subtitle: TextStyle;
  readonly field: ViewStyle;
  readonly reassurance: ViewStyle;
  readonly reassuranceText: TextStyle;
  readonly spacer: ViewStyle;
}

/**
 * Artboard A2: a back bar, the headline pair, one field under 40 pt of air, the reassurance
 * line, and the call to action at the foot.
 *
 * The canvas draws the field 56 pt tall; it renders at the 52 pt control height artboard D
 * defines for every text input in the app ("TEXT INPUT · RADIUS 12, 52 HIGH"), because the
 * field is `AppTextInput` and the shared control height is the one that keeps this screen
 * consistent with the forms in flow B.
 */
export const makePhoneNumberScreenStyles = (theme: Theme): PhoneNumberScreenStyles =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.surface.screen,
    },
    content: {
      flexGrow: 1,
      paddingTop: theme.spacing.space16,
      paddingHorizontal: theme.spacing.space20,
    },
    subtitle: {
      marginTop: theme.spacing.space12,
    },
    field: {
      marginTop: theme.spacing.space40,
    },
    reassurance: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.space8,
      marginTop: theme.spacing.space12,
    },
    reassuranceText: {
      flex: 1,
    },
    spacer: {
      flex: 1,
      minHeight: theme.spacing.space24,
    },
  });
