import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface AppTextInputStyles {
  readonly container: ViewStyle;
  readonly label: TextStyle;
  readonly field: TextStyle;
  readonly fieldResting: TextStyle;
  readonly fieldFocused: TextStyle;
  readonly fieldError: TextStyle;
  readonly fieldDisabled: TextStyle;
  readonly message: ViewStyle;
  readonly messageText: TextStyle;
}

/** The resting and focused rings differ in width; the canvas draws 1 pt and 2 pt. */
const RESTING_BORDER_WIDTH = 1;
const FOCUSED_BORDER_WIDTH = 2;

/**
 * Artboard D, "TEXT INPUT · RADIUS 12, 52 HIGH", plus the error field and inline message from
 * artboards A5 and B7.
 *
 * `minHeight` rather than `height`: the field holds text, and
 * `docs/architecture/principles.md § Sizing` requires a text container to grow with the OS
 * text size instead of clipping. The 52 is the floor the design draws, not a ceiling.
 *
 * The disabled state is the one state artboard D does not draw. Its two colours are taken
 * from the disabled controls it *does* draw — the disabled button's `#e6e0ed` fill and
 * `#797586` label, and the disabled checkbox's `#ddd8e4` edge — read through the roles those
 * shades carry on the theme, so nothing new is invented here.
 */
export const makeAppTextInputStyles = (theme: Theme): AppTextInputStyles =>
  StyleSheet.create({
    container: {
      alignSelf: 'stretch',
    },
    label: {
      marginBottom: theme.spacing.space8,
    },
    field: {
      // The entered text is 16/24 regular — artboard D draws the field untracked, so this is
      // `body` and not the tracked `input` variant, which the canvas uses for the phone
      // number alone. Spread here rather than composed at the call site, so that every style
      // this component applies lives in this file.
      ...theme.typography.body,
      minHeight: theme.sizes.size52,
      borderRadius: theme.borderRadius.radius12,
      paddingHorizontal: theme.spacing.space16,
      color: theme.colors.text.primary,
    },
    fieldResting: {
      backgroundColor: theme.colors.surface.lowest,
      borderWidth: RESTING_BORDER_WIDTH,
      borderColor: theme.colors.border.base,
    },
    fieldFocused: {
      backgroundColor: theme.colors.surface.lowest,
      borderWidth: FOCUSED_BORDER_WIDTH,
      borderColor: theme.colors.border.focus,
    },
    fieldError: {
      backgroundColor: theme.colors.feedback.errorContainer,
      borderWidth: RESTING_BORDER_WIDTH,
      borderColor: theme.colors.border.error,
    },
    fieldDisabled: {
      backgroundColor: theme.colors.surface.containerHighest,
      borderWidth: RESTING_BORDER_WIDTH,
      borderColor: theme.colors.border.dim,
      color: theme.colors.text.tertiary,
    },
    message: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.space6,
      marginTop: theme.spacing.space8,
    },
    messageText: {
      flex: 1,
    },
  });
