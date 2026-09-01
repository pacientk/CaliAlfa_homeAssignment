/**
 * Fixed component dimensions, in logical points. Raw magnitudes, named after their value
 * for the same reason `spacing.ts` and `radii.ts` are: a dimension carries no meaning
 * beyond how large it is, and `docs/architecture/principles.md § Sizing` rules out naming a
 * universal token group after the one component that happens to use it first.
 *
 * T-001 deliberately shipped no dimension scale because the token layer had no call sites.
 * The atom layer is the first one, so the ladder starts here, and every rung below is a
 * value the canvas sources in `Tech Assignment/design/Task app multi-flow design/` actually
 * draw as a width or a height. Later screens extend it the same way — by reading the canvas,
 * never by deriving a value from a neighbouring rung.
 *
 * Icon glyph sizes are **not** here. A Material Symbols glyph is text, so its size is a font
 * size: `primitive/typography.ts § FontSize` already owns that scale and the theme surfaces
 * it as `iconSizes`.
 */
export const Sizes = {
  /** 8 — the thickness of the momentum card's progress bar and of its track. */
  size8: 8,
  /** 20 — the checkbox, and the divider-height of the phone field's country prefix. */
  size20: 20,
  /** 24 — the circular clear button inside a filled search field. */
  size24: 24,
  /** 28 — the task row's three-dot button. */
  size28: 28,
  /** 32 — the pill behind the active tab-bar icon. */
  size32: 32,
  /** 36 — the small icon tile on a welcome benefit row, and the focus-mode block. */
  size36: 36,
  /** 48 — the search field, the confirmation-modal buttons, and an empty state's button. */
  size48: 48,
  /** 52 — the control height: text field, primary button, floating action button, nav bar. */
  size52: 52,
  /** 56 — the task row's minimum height, and the OTP screen's icon tile. */
  size56: 56,
  /** 60 — a single OTP digit box. */
  size60: 60,
  /** 64 — the large icon tile at the centre of an empty state. */
  size64: 64,
} as const;
