import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface OtpCodeRowStyles {
  readonly row: ViewStyle;
  readonly box: ViewStyle;
  readonly boxResting: ViewStyle;
  readonly boxFocused: ViewStyle;
  readonly boxError: ViewStyle;
  readonly digit: TextStyle;
  readonly field: ViewStyle;
}

/** The canvas draws the resting edge at 1 pt and the focus ring at 2 pt. */
const RESTING_BORDER_WIDTH = 1;
const FOCUSED_BORDER_WIDTH = 2;

/**
 * Invisible, but only just — and that is the point.
 *
 * `UIView.hitTest:withEvent:` refuses to return a view whose alpha is below 0.01, so a field
 * at `opacity: 0` is a field the user cannot tap: on the simulator the row simply never took
 * focus. Two hundredths is above UIKit's floor and below anything an eye resolves — the text
 * it draws is `#1c1a23` at 2% on a white box, which is `#fafafa`.
 *
 * It is a component-scoped constant rather than a token because it is not a design value at
 * all: nothing about it comes from the canvas, and there is no second component that could
 * ever want to share it.
 */
const HIT_TESTABLE_OPACITY = 0.02;

/**
 * Artboards A3, A4 and A5: six boxes, 60 pt tall, 8 pt apart, in three palettes.
 *
 * `flex: 1` per box reproduces the canvas's `repeat(6, 1fr)` — the row divides the screen
 * width rather than assuming one, so the boxes stay square-ish on any device. `minHeight`
 * rather than `height` because a box holds a digit and must grow with the OS text size
 * instead of clipping it (`docs/architecture/principles.md § Sizing`).
 *
 * `field` is the real text input, stretched over the row and drawn all but invisibly. The six
 * boxes are the picture; one input is the field. That is a deliberate choice over six inputs:
 * it makes "move forward on entry, back on delete" a property of the caret position rather
 * than six cross-wired focus handlers, it makes a pasted code arrive as one string that
 * simply distributes itself, and it announces one labelled field to a screen reader instead
 * of six unlabelled ones. It is made invisible by opacity rather than moved off-screen so it
 * stays exactly where the user taps, and so VoiceOver still reaches it — iOS does not treat a
 * transparent view as hidden from assistive technology. See `HIT_TESTABLE_OPACITY` for why
 * that opacity is not zero.
 */
export const makeOtpCodeRowStyles = (theme: Theme): OtpCodeRowStyles =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: theme.spacing.space8,
    },
    box: {
      flex: 1,
      minHeight: theme.sizes.size60,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.radius12,
    },
    boxResting: {
      backgroundColor: theme.colors.surface.lowest,
      borderWidth: RESTING_BORDER_WIDTH,
      borderColor: theme.colors.border.base,
    },
    boxFocused: {
      backgroundColor: theme.colors.surface.lowest,
      borderWidth: FOCUSED_BORDER_WIDTH,
      borderColor: theme.colors.border.focus,
    },
    boxError: {
      backgroundColor: theme.colors.feedback.errorContainer,
      borderWidth: RESTING_BORDER_WIDTH,
      borderColor: theme.colors.border.error,
    },
    digit: {
      textAlign: 'center',
    },
    field: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      opacity: HIT_TESTABLE_OPACITY,
    },
  });
