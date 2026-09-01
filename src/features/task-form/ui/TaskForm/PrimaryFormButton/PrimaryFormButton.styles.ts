import type { Theme } from '@ui/tokens';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface PrimaryFormButtonStyles {
  readonly button: ViewStyle;
  readonly buttonEnabled: ViewStyle;
  readonly buttonDisabled: ViewStyle;
}

/**
 * Sheet D's primary button: a 52 pt pill with the level-2 shadow, and the disabled variant
 * artboard B7 draws — `containerHighest` fill, tertiary label, and no shadow, because an
 * elevation on a control that does nothing is a lie about its affordance.
 */
export const makePrimaryFormButtonStyles = (theme: Theme): PrimaryFormButtonStyles =>
  StyleSheet.create({
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: theme.sizes.size52,
      paddingHorizontal: theme.spacing.space22,
      borderRadius: theme.borderRadius.full,
    },
    buttonEnabled: {
      backgroundColor: theme.colors.primary.base,
      ...theme.shadows.level2,
    },
    buttonDisabled: {
      backgroundColor: theme.colors.surface.containerHighest,
    },
  });
