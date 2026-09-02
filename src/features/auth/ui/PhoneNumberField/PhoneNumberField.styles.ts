import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';

export interface PhoneNumberFieldStyles {
  readonly container: ViewStyle;
  readonly label: TextStyle;
  readonly frame: ViewStyle;
  readonly frameResting: ViewStyle;
  readonly frameFocused: ViewStyle;
  readonly frameError: ViewStyle;
  readonly prefix: ViewStyle;
  readonly divider: ViewStyle;
  readonly input: ViewStyle;
  readonly message: ViewStyle;
  readonly messageText: TextStyle;
}

/**
 * Artboard A2's phone field: one rounded box holding the country segment, a hairline, and the
 * number. The frame lives here rather than in the input because the canvas draws one border
 * around both halves — an input with its own border inside this one would be two boxes.
 *
 * The three frame states mirror the text atom's exactly, so the composite is indistinguishable
 * from every other field on the screen.
 */
export const makePhoneNumberFieldStyles = (theme: Theme): PhoneNumberFieldStyles => ({
  container: {
    alignSelf: 'stretch',
  },
  label: {
    marginBottom: theme.spacing.space8,
  },
  frame: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: theme.sizes.size52,
    borderRadius: theme.borderRadius.radius12,
    paddingHorizontal: theme.spacing.space16,
  },
  frameResting: {
    backgroundColor: theme.colors.surface.lowest,
    borderWidth: RESTING_BORDER_WIDTH,
    borderColor: theme.colors.border.base,
  },
  frameFocused: {
    backgroundColor: theme.colors.surface.lowest,
    borderWidth: FOCUSED_BORDER_WIDTH,
    borderColor: theme.colors.border.focus,
  },
  frameError: {
    backgroundColor: theme.colors.feedback.errorContainer,
    borderWidth: RESTING_BORDER_WIDTH,
    borderColor: theme.colors.border.error,
  },
  prefix: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: theme.spacing.space4,
    paddingRight: theme.spacing.space12,
  },
  divider: {
    width: RESTING_BORDER_WIDTH,
    alignSelf: 'stretch',
    marginVertical: theme.spacing.space12,
    backgroundColor: theme.colors.border.base,
  },
  input: {
    flex: 1,
    paddingLeft: theme.spacing.space16,
  },
  message: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    columnGap: theme.spacing.space8,
    marginTop: theme.spacing.space8,
  },
  messageText: {
    flex: 1,
  },
});

/** Artboard D's two ring widths, the same pair the text field uses. */
const RESTING_BORDER_WIDTH = 1;
const FOCUSED_BORDER_WIDTH = 2;
