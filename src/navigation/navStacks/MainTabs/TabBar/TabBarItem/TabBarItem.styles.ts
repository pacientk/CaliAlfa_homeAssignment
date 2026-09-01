import type { Theme } from '@ui/tokens';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface TabBarItemStyles {
  readonly item: ViewStyle;
  readonly pill: ViewStyle;
  readonly pillActive: ViewStyle;
  readonly pillResting: ViewStyle;
}

/**
 * `TabBar.dc.html` draws the pill at a fixed 64 x 32 with a fully rounded radius. `height`
 * rather than `minHeight` is deliberate: the pill holds an icon glyph, and
 * `docs/architecture/principles.md § Sizing` keeps icon glyph sizes structural — the glyph
 * does not grow with the OS text size, so the box around it must not either.
 *
 * The resting fill is the bar's own surface rather than a `transparent` literal. It renders
 * identically on the white bar the design draws, and it stays a token.
 */
export const makeTabBarItemStyles = (theme: Theme): TabBarItemStyles =>
  StyleSheet.create({
    item: {
      flex: 1,
      alignItems: 'center',
      rowGap: theme.spacing.space4,
    },
    pill: {
      width: theme.sizes.size64,
      height: theme.sizes.size32,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.full,
    },
    pillActive: {
      backgroundColor: theme.colors.primary.base,
    },
    pillResting: {
      backgroundColor: theme.colors.surface.lowest,
    },
  });
