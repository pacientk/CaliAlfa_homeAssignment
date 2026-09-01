import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface AppSearchFieldStyles {
  readonly field: ViewStyle;
  readonly fieldResting: ViewStyle;
  readonly fieldActive: ViewStyle;
  readonly input: TextStyle;
  readonly clear: ViewStyle;
}

/** The canvas draws a 1 pt hairline at rest and a 2 pt brand ring once the field is live. */
const RESTING_BORDER_WIDTH = 1;
const ACTIVE_BORDER_WIDTH = 2;

/**
 * Sheet D, "SEARCH FIELD · RADIUS 16, 48 HIGH", and artboard B5 for the filled state.
 *
 * The right padding differs between the two states in the canvas — 16 at rest, 14 once the
 * clear button appears — so that the circular button's edge lands where the placeholder's
 * would have. Both values are named keys here rather than a computed inset.
 *
 * `minHeight` rather than `height`, per `docs/architecture/principles.md § Sizing`: the
 * field holds text and has to grow with the OS text size instead of clipping it.
 */
export const makeAppSearchFieldStyles = (theme: Theme): AppSearchFieldStyles =>
  StyleSheet.create({
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: theme.spacing.space10,
      minHeight: theme.sizes.size48,
      borderRadius: theme.borderRadius.radius16,
      backgroundColor: theme.colors.surface.lowest,
      paddingLeft: theme.spacing.space16,
    },
    fieldResting: {
      borderWidth: RESTING_BORDER_WIDTH,
      borderColor: theme.colors.border.subtle,
      paddingRight: theme.spacing.space16,
    },
    fieldActive: {
      borderWidth: ACTIVE_BORDER_WIDTH,
      borderColor: theme.colors.border.focus,
      paddingRight: theme.spacing.space14,
    },
    input: {
      ...theme.typography.body,
      flex: 1,
      // A text input pads itself on Android and centres its own text on iOS; zeroing the
      // vertical padding is what keeps the 48 pt box the canvas draws from growing.
      paddingVertical: theme.spacing.space0,
      color: theme.colors.text.primary,
    },
    clear: {
      width: theme.sizes.size24,
      height: theme.sizes.size24,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.surface.containerHigh,
    },
  });
