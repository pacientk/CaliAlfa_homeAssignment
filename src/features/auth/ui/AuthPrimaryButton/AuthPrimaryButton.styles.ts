import type { Theme } from '@ui/tokens';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface AuthPrimaryButtonStyles {
  readonly button: ViewStyle;
  readonly buttonEnabled: ViewStyle;
  readonly buttonDisabled: ViewStyle;
}

/**
 * The pill at the foot of artboards A1–A5: 52 high, fully rounded, brand fill with the level-2
 * shadow, and the flat `#e6e0ed` fill artboard D labels as the disabled state.
 *
 * `minHeight` rather than `height` because the pill holds a label — see
 * `docs/architecture/principles.md § Sizing`. The two fills are named variants rather than a
 * computed colour, since each is a theme constant
 * (`docs/architecture/coding-rules.md § No inline styles`, category 2).
 */
export const makeAuthPrimaryButtonStyles = (theme: Theme): AuthPrimaryButtonStyles =>
  StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.space8,
      minHeight: theme.sizes.size52,
      paddingHorizontal: theme.spacing.space22,
      borderRadius: theme.borderRadius.full,
    },
    buttonEnabled: {
      backgroundColor: theme.colors.primary.base,
      ...theme.shadows.level2,
    },
    // No shadow: the canvas draws the disabled pill flat, which is half of what makes it read
    // as unavailable rather than merely grey.
    buttonDisabled: {
      backgroundColor: theme.colors.surface.containerHighest,
    },
  });
