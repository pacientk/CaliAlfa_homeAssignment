import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface AppBottomSheetStyles {
  readonly scrimLayer: ViewStyle;
  readonly scrim: ViewStyle;
  readonly sheetLayer: ViewStyle;
  readonly sheet: ViewStyle;
  readonly grabberBand: ViewStyle;
  readonly grabber: ViewStyle;
  readonly header: ViewStyle;
  readonly title: TextStyle;
  readonly close: ViewStyle;
  readonly divider: ViewStyle;
}

/**
 * Artboard A6: a sheet against the bottom edge, top corners at radius 24 and the bottom square,
 * over the same 40 % scrim the app already uses.
 *
 * It is a native modal window rather than an absolutely positioned overlay for the reason
 * artboard B3 gives: a screen inside the tab navigator ends where the bar begins, so an
 * in-screen overlay would leave the tab bar lit under a dimmed page.
 *
 * The chrome is fixed — a grabber band, a header, a divider — and the body below it sizes
 * itself. That is what keeps the sheet's own height derived rather than declared: the picker's
 * list window is what decides how tall the sheet is, and the design's 508 falls out of
 * 24 + 52 + 1 + 397 + the device's bottom inset.
 */
export const makeAppBottomSheetStyles = (theme: Theme): AppBottomSheetStyles => ({
  // The scrim and the sheet are separate layers so they can animate separately: the dim
  // fades where the sheet slides. Both fill the window; the sheet layer only lays its child
  // out against the bottom edge.
  scrimLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.surface.scrim,
  },
  scrim: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  sheetLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface.lowest,
    borderTopLeftRadius: theme.borderRadius.radius24,
    borderTopRightRadius: theme.borderRadius.radius24,
    overflow: 'hidden',
    ...theme.shadows.level2,
  },
  grabberBand: {
    height: theme.spacing.space24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grabber: {
    width: GRABBER_WIDTH,
    height: GRABBER_HEIGHT,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface.dim,
  },
  // One header for every sheet, at the 20/28 card-title size. A picker's caption was too
  // quiet to be a heading and a confirmation's display face was too loud for a strip this
  // tall; the size in between is a heading in both.
  header: {
    minHeight: theme.sizes.size52,
    paddingVertical: theme.spacing.space8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: theme.spacing.space20,
    paddingRight: theme.spacing.space16,
  },
  title: {
    flex: 1,
  },
  close: {
    width: theme.sizes.size32,
    height: theme.sizes.size32,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface.container,
  },
  divider: {
    height: DIVIDER_HEIGHT,
    backgroundColor: theme.colors.surface.container,
  },
});

/** A6's grabber: 36 by 4, the only two numbers in the chrome that are not on a scale. */
const GRABBER_WIDTH = 36;
const GRABBER_HEIGHT = 4;

const DIVIDER_HEIGHT = 1;
