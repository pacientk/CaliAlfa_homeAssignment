import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';

export interface AppBottomSheetStyles {
  readonly scrim: ViewStyle;
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
  scrim: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.surface.scrim,
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
  header: {
    height: theme.sizes.size52,
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
