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
 * No `lineHeight`. The canvas sets every icon span to `line-height:1`, and copying that here
 * was wrong: a line box the height of the em box does not centre a Material Symbols glyph on
 * iOS, it pins it to the top. The font's ascent reaches above the em square, and UIKit lays
 * text out from the top of the line box — so the glyph rides up and out, which is why every
 * icon in the app sat high in its container.
 *
 * Leaving the line height to the font gives a box tall enough for the glyph's real metrics,
 * and the glyph then sits in the middle of it. Callers centre that box the way they centre
 * any other child.
 *
 * `textAlignVertical` is not the fix; it is an Android-only property and does nothing here.
 */
export const makeAppIconStyles = (theme: Theme): AppIconStyles => ({
  face: { fontFamily: theme.iconFontFamily },
  size: StyleSheet.create({
    size12: { fontSize: theme.iconSizes.size12 },
    size14: { fontSize: theme.iconSizes.size14 },
    size16: { fontSize: theme.iconSizes.size16 },
    size18: { fontSize: theme.iconSizes.size18 },
    size20: { fontSize: theme.iconSizes.size20 },
    size22: { fontSize: theme.iconSizes.size22 },
    size24: { fontSize: theme.iconSizes.size24 },
    size26: { fontSize: theme.iconSizes.size26 },
    size28: { fontSize: theme.iconSizes.size28 },
    size30: { fontSize: theme.iconSizes.size30 },
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
