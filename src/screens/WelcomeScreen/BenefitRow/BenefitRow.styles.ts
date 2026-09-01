import type { Theme } from '@ui/tokens';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface BenefitRowStyles {
  readonly row: ViewStyle;
  readonly tile: ViewStyle;
  readonly copy: ViewStyle;
}

/**
 * Artboard A1's benefit row: a 36 pt brand tile, then a title over a caption, on a white card
 * with the level-1 shadow.
 *
 * The tile keeps a fixed `width`/`height` and never shrinks: it holds a glyph, not text, and
 * `docs/architecture/principles.md § Sizing` keeps icon glyph sizes raw when the OS text size
 * grows. The copy beside it is what absorbs the growth, which is why it takes the remaining
 * width rather than a share of it.
 */
export const makeBenefitRowStyles = (theme: Theme): BenefitRowStyles =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.space14,
      paddingVertical: theme.spacing.space14,
      paddingHorizontal: theme.spacing.space16,
      borderRadius: theme.borderRadius.radius16,
      backgroundColor: theme.colors.surface.lowest,
      ...theme.shadows.level1,
    },
    tile: {
      width: theme.sizes.size36,
      height: theme.sizes.size36,
      flexShrink: 0,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.radius12,
      backgroundColor: theme.colors.primary.fixed,
    },
    copy: {
      flex: 1,
    },
  });
