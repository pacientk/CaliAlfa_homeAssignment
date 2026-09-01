import type { Theme } from '@ui/tokens';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface TaskCheckboxStyles {
  readonly box: ViewStyle;
  readonly boxUnchecked: ViewStyle;
  readonly boxChecked: ViewStyle;
  readonly boxExpired: ViewStyle;
}

/** Sheet D draws the box with a 2 pt edge in all three states. A border width is structural. */
const BOX_BORDER_WIDTH = 2;

/**
 * Sheet D, "CHECKBOX · 20 × 20, RADIUS 8", and the per-state fills enumerated in
 * `TaskRow.dc.html`.
 *
 * The three fills are named variants rather than a computed colour because each one is a
 * theme constant — `docs/architecture/coding-rules.md § No inline styles`, category 2.
 */
export const makeTaskCheckboxStyles = (theme: Theme): TaskCheckboxStyles =>
  StyleSheet.create({
    box: {
      width: theme.sizes.size20,
      height: theme.sizes.size20,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.radius8,
      borderWidth: BOX_BORDER_WIDTH,
    },
    boxUnchecked: {
      backgroundColor: theme.colors.surface.lowest,
      borderColor: theme.colors.border.base,
    },
    boxChecked: {
      backgroundColor: theme.colors.feedback.success,
      borderColor: theme.colors.feedback.success,
    },
    boxExpired: {
      backgroundColor: theme.colors.surface.containerHighest,
      borderColor: theme.colors.border.dim,
    },
  });
