import type { ViewStyle } from 'react-native';

import { Palette } from './palette';

/**
 * The design defines two elevation levels and no others:
 *
 *   level 1 — `0 4px 12px rgba(0, 0, 0, 0.05)`      cards and list rows
 *   level 2 — `0 8px 24px rgba(93, 63, 211, 0.15)`  primary buttons, the FAB, modals
 *
 * `shadowRadius` is deliberately half the CSS blur radius. A CSS blur radius is twice the
 * Gaussian sigma, while `CALayer.shadowRadius` — which is what React Native's iOS shadow
 * props drive — is the sigma itself. Passing 12 and 24 through unchanged would render both
 * shadows at twice the spread the canvas draws.
 *
 * The Android `elevation` values are the closest stock elevations to each level. Android is
 * out of scope for this app; they are here so the token is complete rather than because
 * anything renders them.
 */
const LEVEL_1_OFFSET_Y = 4;
const LEVEL_1_BLUR_SIGMA = 6;
const LEVEL_1_OPACITY = 0.05;
const LEVEL_1_ELEVATION = 2;

const LEVEL_2_OFFSET_Y = 8;
const LEVEL_2_BLUR_SIGMA = 12;
const LEVEL_2_OPACITY = 0.15;
const LEVEL_2_ELEVATION = 8;

export const Shadows = {
  /** Cards and list rows. */
  level1: {
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: LEVEL_1_OFFSET_Y },
    shadowOpacity: LEVEL_1_OPACITY,
    shadowRadius: LEVEL_1_BLUR_SIGMA,
    elevation: LEVEL_1_ELEVATION,
  },
  /** Primary buttons, the floating action button, modals. */
  level2: {
    shadowColor: Palette.purple400,
    shadowOffset: { width: 0, height: LEVEL_2_OFFSET_Y },
    shadowOpacity: LEVEL_2_OPACITY,
    shadowRadius: LEVEL_2_BLUR_SIGMA,
    elevation: LEVEL_2_ELEVATION,
  },
} as const satisfies Record<string, ViewStyle>;
