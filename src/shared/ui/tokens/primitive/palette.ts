/**
 * Raw colour values. No semantics — a shade here says how dark it is, not what it is for.
 * Role names live in `themes/light.ts`; components never import this file.
 *
 * Every value is taken verbatim from the canvas sources in
 * `Tech Assignment/design/Task app multi-flow design/*.dc.html`. The canvas uses exactly
 * these 22 colours and no others, so the list is closed: a screen that needs a colour that
 * is not here is a design question, not an implementation one.
 */
export const Palette = {
  /** #e6deff — badge and active-icon backgrounds. */
  purple100: '#e6deff',
  /** #d8ceff — text and progress fill on the filled primary container. */
  purple200: '#d8ceff',
  /** #7a63dd — progress track on the filled primary container. */
  purple300: '#7a63dd',
  /** #5d3fd3 — the momentum card fill, and the tint of the level-2 shadow. */
  purple400: '#5d3fd3',
  /** #451ebb — CTAs, active tab, links, focus ring. */
  purple500: '#451ebb',
  /** #3a18a0 — the pressed state of #451ebb. */
  purple600: '#3a18a0',

  /** #ffffff — cards, tab bar, text on a filled primary surface. */
  neutral0: '#ffffff',
  /** #fdf8ff — the screen background. */
  neutral50: '#fdf8ff',
  /** #f7f1fe — the low surface: hero panel, inline info panel. */
  neutral100: '#f7f1fe',
  /** #f4f2f7 — the canvas behind the artboards. Not a screen colour; unused by the theme. */
  neutral150: '#f4f2f7',
  /** #f1ecf8 — surface container: the expired task card fill. */
  neutral200: '#f1ecf8',
  /** #ebe6f3 — surface container high: chips, dividers, the tab-bar top border. */
  neutral300: '#ebe6f3',
  /** #e6e0ed — surface container highest: expired chip fill, disabled checkbox fill. */
  neutral400: '#e6e0ed',
  /** #ddd8e4 — surface dim: the disabled checkbox border. */
  neutral500: '#ddd8e4',
  /** #c9c4d7 — outline variant: input borders, the unchecked checkbox border. */
  neutral600: '#c9c4d7',
  /** #797586 — tertiary text, outline, the expired task title. */
  neutral700: '#797586',
  /** #484554 — secondary text and the completed task title. */
  neutral800: '#484554',
  /** #1c1a23 — primary text. */
  neutral900: '#1c1a23',

  /** #ffdad6 — error container. */
  red100: '#ffdad6',
  /** #ba1a1a — error. */
  red500: '#ba1a1a',
  /** #93000a — text and icons on the error container. */
  red900: '#93000a',

  /** #0f7a52 — success. A checked checkbox and completion only. 5.4:1 on white. */
  green500: '#0f7a52',

  /**
   * #000000 — not a design colour. It exists solely as the tint of the level-1 shadow,
   * which the design specifies as `rgba(0, 0, 0, 0.05)`. See `shadows.ts`.
   */
  black: '#000000',
} as const;
