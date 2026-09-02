import type { Theme } from '@ui/tokens';
import type { TextStyle } from 'react-native';
import { StyleSheet } from 'react-native';

import type { TextColorRole } from '../AppText';
import type { IconSize } from './IAppIcon';

export interface AppIconStyles {
  readonly face: TextStyle;
  readonly size: Record<IconSize, TextStyle>;
  readonly color: Record<TextColorRole, TextStyle>;
}

/**
 * `lineHeight` equals `fontSize` on every rung because the canvas sets every icon span to
 * `line-height:1`. A Material Symbols glyph is drawn to fill its em box, so a line box the
 * same height as the em box is what centres the glyph inside a fixed-size tile; React
 * Native's default line height would add leading above and below and push the glyph off
 * centre by a pixel or two at every size.
 */
export const makeAppIconStyles = (theme: Theme): AppIconStyles => ({
  face: { fontFamily: theme.iconFontFamily },
  size: StyleSheet.create({
    size12: { fontSize: theme.iconSizes.size12, lineHeight: theme.iconSizes.size12 },
    size14: { fontSize: theme.iconSizes.size14, lineHeight: theme.iconSizes.size14 },
    size16: { fontSize: theme.iconSizes.size16, lineHeight: theme.iconSizes.size16 },
    size18: { fontSize: theme.iconSizes.size18, lineHeight: theme.iconSizes.size18 },
    size20: { fontSize: theme.iconSizes.size20, lineHeight: theme.iconSizes.size20 },
    size22: { fontSize: theme.iconSizes.size22, lineHeight: theme.iconSizes.size22 },
    size24: { fontSize: theme.iconSizes.size24, lineHeight: theme.iconSizes.size24 },
    size26: { fontSize: theme.iconSizes.size26, lineHeight: theme.iconSizes.size26 },
    size28: { fontSize: theme.iconSizes.size28, lineHeight: theme.iconSizes.size28 },
    size30: { fontSize: theme.iconSizes.size30, lineHeight: theme.iconSizes.size30 },
  }),
  color: StyleSheet.create({
    primary: { color: theme.colors.text.primary },
    secondary: { color: theme.colors.text.secondary },
    tertiary: { color: theme.colors.text.tertiary },
    accent: { color: theme.colors.text.accent },
    onPrimary: { color: theme.colors.text.onPrimary },
    onPrimaryContainer: { color: theme.colors.text.onPrimaryContainer },
    error: { color: theme.colors.text.error },
    onErrorContainer: { color: theme.colors.text.onErrorContainer },
    success: { color: theme.colors.text.success },
  }),
});
