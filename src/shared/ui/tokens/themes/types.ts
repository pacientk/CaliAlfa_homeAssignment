import type { TextStyle, ViewStyle } from 'react-native';

/**
 * The semantic contract every component reads through `useTheme()`. Roles, never shades:
 * a component asks for `colors.text.secondary`, not for a purple.
 */

export interface PrimaryColors {
  /** Calls to action, the active tab, links, the focus ring. */
  readonly base: string;
  /** The pressed state of `base`. */
  readonly pressed: string;
  /** A filled brand surface — the momentum card. */
  readonly container: string;
  /** A muted brand fill on top of `container` — the progress track. */
  readonly muted: string;
  /** A pale brand fill on a neutral surface — badges, the active tab pill. */
  readonly fixed: string;
  /** Content on top of `base`. */
  readonly onBase: string;
  /** Content on top of `container`. */
  readonly onContainer: string;
}

export interface SurfaceColors {
  /** The screen background. */
  readonly screen: string;
  /** Cards and the tab bar — the surface that sits above the screen. */
  readonly lowest: string;
  /** Quiet panels inside a screen. */
  readonly low: string;
  /** A recessed container — the expired task card. */
  readonly container: string;
  /** Chips and dividers. */
  readonly containerHigh: string;
  /** The most recessed fill — an expired chip, a disabled checkbox. */
  readonly containerHighest: string;
  /** A dimmed edge on a disabled control. */
  readonly dim: string;
  /** The translucent wash behind a modal. */
  readonly scrim: string;
}

export interface TextColors {
  readonly primary: string;
  readonly secondary: string;
  readonly tertiary: string;
  /** Brand-coloured text: navigation titles, links. */
  readonly accent: string;
  /** Text on `colors.primary.base`. */
  readonly onPrimary: string;
  /** Text on `colors.primary.container`. */
  readonly onPrimaryContainer: string;
  /** Error text on a neutral surface. */
  readonly error: string;
  /** Text on `colors.feedback.errorContainer`. */
  readonly onErrorContainer: string;
}

export interface BorderColors {
  /** Dividers and the tab-bar hairline. */
  readonly subtle: string;
  /** Input fields and the unchecked checkbox. */
  readonly base: string;
  /** The edge of a recessed container. */
  readonly muted: string;
  /** The edge of a disabled control. */
  readonly dim: string;
  /** The focus ring. */
  readonly focus: string;
  /** An invalid field. */
  readonly error: string;
}

export interface FeedbackColors {
  readonly error: string;
  readonly errorContainer: string;
  readonly onErrorContainer: string;
  /** Completion only — a checked checkbox and the completed progress fill. */
  readonly success: string;
}

export interface ThemeColors {
  readonly primary: PrimaryColors;
  readonly surface: SurfaceColors;
  readonly text: TextColors;
  readonly border: BorderColors;
  readonly feedback: FeedbackColors;
}

/** The dimensional rhythm, surfaced on the theme so no component reaches for a primitive. */
export interface SpacingScale {
  readonly space0: number;
  readonly space2: number;
  readonly space4: number;
  readonly space6: number;
  readonly space8: number;
  readonly space10: number;
  readonly space12: number;
  readonly space14: number;
  readonly space16: number;
  readonly space20: number;
  readonly space22: number;
  readonly space24: number;
  readonly space40: number;
  readonly space56: number;
  readonly space120: number;
}

export interface RadiusScale {
  readonly radius8: number;
  readonly radius12: number;
  readonly radius14: number;
  readonly radius16: number;
  readonly radius20: number;
  readonly radius24: number;
  readonly radius32: number;
  readonly full: number;
}

/**
 * Fixed component dimensions the design draws — control heights, tile sizes, the checkbox.
 * Surfaced so no component hard-codes a height; see `primitive/sizes.ts`.
 */
export interface SizeScale {
  readonly size8: number;
  readonly size20: number;
  readonly size24: number;
  readonly size28: number;
  readonly size32: number;
  readonly size36: number;
  readonly size48: number;
  readonly size52: number;
  readonly size56: number;
  readonly size60: number;
  readonly size64: number;
}

/**
 * Glyph sizes for icon text. A Material Symbols glyph is text set at the size of its em box,
 * so this is the font-size scale under the name the icon primitive reads it by — the same
 * object as `primitive/typography.ts § FontSize`, not a second copy of those numbers.
 */
export interface IconSizeScale {
  readonly size12: number;
  readonly size14: number;
  readonly size16: number;
  readonly size18: number;
  readonly size20: number;
  readonly size22: number;
  readonly size24: number;
  readonly size26: number;
  readonly size28: number;
  readonly size30: number;
}

/**
 * Named text styles. Each one is a size / line height / weight / tracking pairing that the
 * canvas actually draws; components pick a role and never compose their own.
 */
export interface TypographyVariants {
  /** 28/34 bold — screen headlines. */
  readonly headline: TextStyle;
  /** 24/32 semibold — navigation, modal, and empty-state titles; OTP digits. */
  readonly title: TextStyle;
  /** 20/28 bold — the momentum card title on a filled surface. */
  readonly cardTitle: TextStyle;
  /** 18/28 semibold — the settings account row. */
  readonly subtitle: TextStyle;
  /** 16/24 regular — body copy and the task-row title. */
  readonly body: TextStyle;
  /** 16/24 semibold — an emphasised row label. */
  readonly bodyStrong: TextStyle;
  /** 16/24 regular, tracked — text entered into a field. */
  readonly input: TextStyle;
  /** 14/20 regular — secondary copy. */
  readonly bodySmall: TextStyle;
  /** 14/20 semibold, tracked — button labels and row-menu items. */
  readonly label: TextStyle;
  /** 14/20 semibold — the title line of an inline error. */
  readonly labelPlain: TextStyle;
  /** 12/16 regular — helper text. */
  readonly caption: TextStyle;
  /** 12/16 medium — chips and tab-bar labels. */
  readonly captionMedium: TextStyle;
  /** 12/16 medium, tracked — the status chip on the welcome hero. */
  readonly chipLabel: TextStyle;
  /** 12/16 semibold — calendar weekday letters. */
  readonly captionStrong: TextStyle;
  /** 12/16 semibold, wide-tracked — an eyebrow label above a heading. */
  readonly overline: TextStyle;
}

export interface ShadowTokens {
  /** Cards and list rows. */
  readonly level1: ViewStyle;
  /** Primary buttons, the floating action button, modals. */
  readonly level2: ViewStyle;
}

export interface Theme {
  readonly colors: ThemeColors;
  readonly spacing: SpacingScale;
  readonly borderRadius: RadiusScale;
  readonly sizes: SizeScale;
  readonly iconSizes: IconSizeScale;
  readonly typography: TypographyVariants;
  readonly shadows: ShadowTokens;
  /**
   * The family name of the bundled Material Symbols Outlined face, applied once by the icon
   * primitive. A font family is a design value like any other, so it belongs on the theme
   * rather than as a string literal inside a component.
   */
  readonly iconFontFamily: string;
  /**
   * The cap on the OS text-size multiplier, applied once by the text primitive. Declared
   * here so no component derives a multiplier of its own — see
   * `docs/architecture/principles.md § Sizing and Design Values`.
   */
  readonly maxFontSizeMultiplier: number;
}
