/**
 * The dimensional rhythm, in logical points. Raw magnitudes — spacing carries no meaning
 * beyond how large it is, so the rungs are named after their value rather than after a
 * component, which `docs/architecture/principles.md § Sizing` rules out ("new token groups
 * are universal, not per-component").
 *
 * Every rung is a value the canvas actually uses as a gap, padding, or margin inside an
 * artboard. Values that only appear in the canvas chrome around the artboards (32, 64) are
 * deliberately absent.
 */
export const Spacing = {
  /** 0 — reset a padding or margin. */
  space0: 0,
  /** 2 — a subtitle directly under its title. */
  space2: 2,
  /** 4 — icon to label, chip vertical padding. */
  space4: 4,
  /** 6 — stacked validation messages, icon-to-text inside an inline error. */
  space6: 6,
  /** 8 — the base rhythm unit. */
  space8: 8,
  /** 10 — chip horizontal padding, calendar cell gap. */
  space10: 10,
  /** 12 — the gap between related controls. */
  space12: 12,
  /** 14 — task-row and menu-item padding. */
  space14: 14,
  /** 16 — the gutter between blocks inside a section. */
  space16: 16,
  /** 20 — the 20 pt horizontal screen margin, and card padding. */
  space20: 20,
  /** 22 — the horizontal padding of the pill-shaped floating action button. */
  space22: 22,
  /** 24 — between logical sections. */
  space24: 24,
  /** 40 — macro whitespace above a primary call to action. */
  space40: 40,
  /** 56 — the top inset of a centred empty state. */
  space56: 56,
} as const;
