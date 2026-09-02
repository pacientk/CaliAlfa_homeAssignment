import { Palette } from '../primitive/palette';
import { Radii } from '../primitive/radii';
import { Shadows } from '../primitive/shadows';
import { Sizes } from '../primitive/sizes';
import { Spacing } from '../primitive/spacing';
import {
  FontFamily,
  FontScale,
  FontSize,
  FontWeight,
  LetterSpacing,
  LineHeight,
} from '../primitive/typography';
import type { Theme } from './types';

/**
 * The one theme. `docs/architecture/PROJECT-PROFILE.md` declares a single light theme, so
 * there is no second file here and the OS-appearance APIs are banned outright.
 *
 * Every value below is a reference into `../primitive/`. Nothing is declared twice, and the
 * primitives are the only place a literal design value exists.
 */

export const lightTheme: Theme = {
  colors: {
    primary: {
      base: Palette.purple500,
      pressed: Palette.purple600,
      container: Palette.purple400,
      muted: Palette.purple300,
      fixed: Palette.purple100,
      onBase: Palette.neutral0,
      onContainer: Palette.purple200,
    },
    surface: {
      screen: Palette.neutral50,
      lowest: Palette.neutral0,
      low: Palette.neutral100,
      container: Palette.neutral200,
      containerHigh: Palette.neutral300,
      containerHighest: Palette.neutral400,
      dim: Palette.neutral500,
      scrim: Palette.scrim,
    },
    text: {
      primary: Palette.neutral900,
      secondary: Palette.neutral800,
      tertiary: Palette.neutral700,
      accent: Palette.purple500,
      onPrimary: Palette.neutral0,
      onPrimaryContainer: Palette.purple200,
      error: Palette.red500,
      onErrorContainer: Palette.red900,
      success: Palette.green500,
    },
    border: {
      subtle: Palette.neutral300,
      base: Palette.neutral600,
      muted: Palette.neutral400,
      dim: Palette.neutral500,
      focus: Palette.purple500,
      error: Palette.red500,
    },
    feedback: {
      error: Palette.red500,
      errorContainer: Palette.red100,
      onErrorContainer: Palette.red900,
      success: Palette.green500,
    },
  },

  spacing: Spacing,
  borderRadius: Radii,
  sizes: Sizes,

  // A Material Symbols glyph is text set at the size of its em box, so the icon primitive
  // reads its size from the font-size scale rather than from a second ladder of the same
  // numbers. The name below is what makes that reading explicit at the call site.
  iconSizes: FontSize,
  iconFontFamily: FontFamily.icon,

  typography: {
    headline: {
      fontFamily: FontFamily.bold,
      fontSize: FontSize.size28,
      lineHeight: LineHeight.height34,
      fontWeight: FontWeight.bold,
      letterSpacing: LetterSpacing.headline,
    },
    title: {
      fontFamily: FontFamily.semiBold,
      fontSize: FontSize.size24,
      lineHeight: LineHeight.height32,
      fontWeight: FontWeight.semiBold,
      letterSpacing: LetterSpacing.title,
    },
    cardTitle: {
      fontFamily: FontFamily.bold,
      fontSize: FontSize.size20,
      lineHeight: LineHeight.height28,
      fontWeight: FontWeight.bold,
      letterSpacing: LetterSpacing.cardTitle,
    },
    subtitle: {
      fontFamily: FontFamily.semiBold,
      fontSize: FontSize.size18,
      lineHeight: LineHeight.height28,
      fontWeight: FontWeight.semiBold,
      letterSpacing: LetterSpacing.none,
    },
    body: {
      fontFamily: FontFamily.regular,
      fontSize: FontSize.size16,
      lineHeight: LineHeight.height20,
      fontWeight: FontWeight.regular,
      letterSpacing: LetterSpacing.none,
    },
    bodyStrong: {
      fontFamily: FontFamily.semiBold,
      fontSize: FontSize.size16,
      lineHeight: LineHeight.height24,
      fontWeight: FontWeight.semiBold,
      letterSpacing: LetterSpacing.none,
    },
    input: {
      fontFamily: FontFamily.regular,
      fontSize: FontSize.size16,
      lineHeight: LineHeight.height24,
      fontWeight: FontWeight.regular,
      letterSpacing: LetterSpacing.input,
    },
    bodySmall: {
      fontFamily: FontFamily.regular,
      fontSize: FontSize.size14,
      lineHeight: LineHeight.height20,
      fontWeight: FontWeight.regular,
      letterSpacing: LetterSpacing.none,
    },
    label: {
      fontFamily: FontFamily.semiBold,
      fontSize: FontSize.size14,
      lineHeight: LineHeight.height20,
      fontWeight: FontWeight.semiBold,
      letterSpacing: LetterSpacing.label,
    },
    labelPlain: {
      fontFamily: FontFamily.semiBold,
      fontSize: FontSize.size14,
      lineHeight: LineHeight.height20,
      fontWeight: FontWeight.semiBold,
      letterSpacing: LetterSpacing.none,
    },
    caption: {
      fontFamily: FontFamily.regular,
      fontSize: FontSize.size12,
      lineHeight: LineHeight.height16,
      fontWeight: FontWeight.regular,
      letterSpacing: LetterSpacing.none,
    },
    captionMedium: {
      fontFamily: FontFamily.medium,
      fontSize: FontSize.size12,
      lineHeight: LineHeight.height16,
      fontWeight: FontWeight.medium,
      letterSpacing: LetterSpacing.none,
    },
    chipLabel: {
      fontFamily: FontFamily.medium,
      fontSize: FontSize.size12,
      lineHeight: LineHeight.height16,
      fontWeight: FontWeight.medium,
      letterSpacing: LetterSpacing.chip,
    },
    captionStrong: {
      fontFamily: FontFamily.semiBold,
      fontSize: FontSize.size12,
      lineHeight: LineHeight.height16,
      fontWeight: FontWeight.semiBold,
      letterSpacing: LetterSpacing.none,
    },
    overline: {
      fontFamily: FontFamily.semiBold,
      fontSize: FontSize.size12,
      lineHeight: LineHeight.height16,
      fontWeight: FontWeight.semiBold,
      letterSpacing: LetterSpacing.overline,
    },
  },

  shadows: Shadows,

  maxFontSizeMultiplier: FontScale.max,
};
