/**
 * The public surface of the token layer. External code imports this barrel and nothing
 * deeper: `primitive/` is private, and the shades in it are not something a component may
 * reach for.
 *
 * `lightTheme` is exported for the provider and for tests that assert a resolved style
 * value. Components read design values through `useTheme` / `useThemedStyles` — never by
 * importing the theme object.
 */
export type { IThemeProviderProps } from './IThemeProvider';
export { ThemeProvider } from './ThemeProvider';
export { lightTheme } from './themes/light';
export type {
  BorderColors,
  FeedbackColors,
  PrimaryColors,
  RadiusScale,
  ShadowTokens,
  SpacingScale,
  SurfaceColors,
  TextColors,
  Theme,
  ThemeColors,
  TypographyVariants,
} from './themes/types';
export { ThemeProviderMissingError, useTheme } from './useTheme';
export { useThemedStyles } from './useThemedStyles';
