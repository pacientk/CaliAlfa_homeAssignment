import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface FocusModeBlockStyles {
  readonly block: ViewStyle;
  readonly glyph: TextStyle;
}

/**
 * Sheet D, "FOCUS MODE BLOCK · DECORATIVE".
 *
 * The glyph's colour is the filled-brand purple, which is a *surface* role on this theme and
 * therefore not one of the eight text roles `AppIcon` offers. That is exactly the case the
 * icon primitive's `style` prop documents, so the colour is declared here rather than passed
 * as a literal at the call site.
 */
export const makeFocusModeBlockStyles = (theme: Theme): FocusModeBlockStyles =>
  StyleSheet.create({
    block: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      columnGap: theme.spacing.space8,
      minHeight: theme.sizes.size36,
      borderRadius: theme.borderRadius.radius12,
      backgroundColor: theme.colors.surface.container,
    },
    glyph: {
      color: theme.colors.primary.container,
    },
  });
