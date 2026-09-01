/**
 * Corner radii, in logical points. Raw magnitudes; the eight rungs below are exactly the
 * radii the canvas draws.
 */
export const Radii = {
  /** 8 — checkboxes and small controls. */
  radius8: 8,
  /** 12 — inputs, OTP boxes, the row menu, banners. */
  radius12: 12,
  /** 14 — compact cards inside the component sheet. */
  radius14: 14,
  /** 16 — task cards and panels. */
  radius16: 16,
  /** 20 — the momentum card and large icon tiles. */
  radius20: 20,
  /** 24 — the welcome hero panel and modals. */
  radius24: 24,
  /** 32 — the device frame itself. */
  radius32: 32,
  /** 9999 — pills: chips, the floating action button, progress bars, tab indicators. */
  full: 9999,
} as const;
