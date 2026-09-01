import type { Theme } from '@ui/tokens';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface TabBarStyles {
  readonly bar: ViewStyle;
}

/**
 * A border width is a structural value, not vertical rhythm, so it stays raw when the OS text
 * size grows — `docs/architecture/principles.md § Sizing`. It is named here rather than
 * inlined so the number is not mistaken for a token.
 */
const TAB_BAR_BORDER_WIDTH = 1;

/**
 * From `Tech Assignment/design/Task app multi-flow design/TabBar.dc.html`: a white bar under
 * a one-point hairline, `padding: 8px 12px 34px`, three equal columns four points apart.
 *
 * The 34 is not in here because it is not a design value — it is the iPhone's home-indicator
 * inset, which the canvas happens to have drawn for the frame it was authored on. The
 * component reads it from the safe area instead.
 */
export const makeTabBarStyles = (theme: Theme): TabBarStyles =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface.lowest,
      borderTopWidth: TAB_BAR_BORDER_WIDTH,
      borderTopColor: theme.colors.border.subtle,
      paddingTop: theme.spacing.space8,
      paddingHorizontal: theme.spacing.space12,
      columnGap: theme.spacing.space4,
    },
  });
