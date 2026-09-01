/**
 * Raw type scales. The named text styles that pair them live on the theme
 * (`themes/light.ts § typography`) — nothing here carries a role.
 *
 * The design is set in Inter, bundled from `assets/fonts/`. The four static files carry
 * three different legacy family names in their name tables (`Inter`, `Inter Medium`,
 * `Inter SemiBold`) but UIKit reports a single `Inter` family holding all four, so a family
 * lookup does resolve — verified on the iPhone 16 Pro simulator.
 *
 * Each weight is nevertheless addressed by its PostScript name. That names one face exactly
 * instead of leaning on React Native's closest-weight search inside a family
 * (RCTFont.mm / RCTFontUtils.mm), and it is the same string Android would look the file up
 * by. Every variant on the theme still pairs the family below with its matching
 * `FontWeight`, so if that search does run it cannot land on the wrong face.
 */
export const FontFamily = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  /**
   * The icon face. Every glyph the design draws is a Material Symbols Outlined ligature, so
   * an icon is text and its face is a font family like any other — which is why it lives
   * here rather than as a literal inside the icon primitive. This is a family name and not a
   * PostScript name because the variable font ships one face; the theme surfaces it as
   * `iconFontFamily`.
   */
  icon: 'Material Symbols Outlined',
} as const;

/** Weights the design uses. Always paired with the matching `FontFamily` entry. */
export const FontWeight = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
} as const;

/** Font sizes present in the design, in points. Also the glyph sizes for icon text. */
export const FontSize = {
  size12: 12,
  size14: 14,
  size16: 16,
  size18: 18,
  size20: 20,
  size22: 22,
  size24: 24,
  size26: 26,
  size28: 28,
  size30: 30,
} as const;

/** Line heights present in the design, in points. */
export const LineHeight = {
  height16: 16,
  height18: 18,
  height20: 20,
  height22: 22,
  height24: 24,
  height28: 28,
  height32: 32,
  height34: 34,
} as const;

/**
 * Letter spacing, in points. The canvas authors it in `em`, which is relative to the font
 * size, while React Native takes points — so each rung is the canvas `em` value resolved
 * at the one size it is used with, and is named after that pairing.
 */
export const LetterSpacing = {
  /** 0 — the default; most of the design is untracked. */
  none: 0,
  /** -0.56 — -0.02em at 28: screen headlines. */
  headline: -0.56,
  /** -0.24 — -0.01em at 24: navigation, modal, and empty-state titles. */
  title: -0.24,
  /** -0.2 — -0.01em at 20: the momentum card title. */
  cardTitle: -0.2,
  /** 0.32 — 0.02em at 16: the phone-number field. */
  input: 0.32,
  /** 0.6 — 0.05em at 12: the "Focus Mode Active" chip. */
  chip: 0.6,
  /** 0.7 — 0.05em at 14: button labels and row-menu items. */
  label: 0.7,
  /** 0.96 — 0.08em at 12: eyebrow labels above a heading. */
  overline: 0.96,
} as const;

/**
 * The ceiling on the OS text-size multiplier. Text may grow to 130% of its authored size
 * before the layout is asked to absorb more than it can: the 402 x 874 pt frame the design
 * is drawn on has a fixed-height task row and a three-item tab bar, and past this point the
 * tab labels and the row title stop fitting. Surfaced on the theme and applied once, by the
 * text primitive — never re-derived inside a component.
 */
export const FontScale = {
  max: 1.3,
} as const;
