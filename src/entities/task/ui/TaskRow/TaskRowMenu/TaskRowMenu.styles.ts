import type { Theme } from '@ui/tokens';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface TaskRowMenuStyles {
  readonly menu: ViewStyle;
  readonly item: ViewStyle;
  readonly divider: ViewStyle;
}

/** A hairline, structural rather than rhythmic, so it stays raw as the OS text size grows. */
const HAIRLINE_WIDTH = 1;

/**
 * `TaskRow.dc.html`, the `menuOpen` branch: a level-1 card 6 pt under the row, radius 12,
 * a `containerHigh` edge, and two 12 × 16 rows split by an inset hairline.
 *
 * `overflow: 'hidden'` is what clips the two items to the rounded corners; without it the
 * pressed feedback squares off the top and bottom of the card.
 */
export const makeTaskRowMenuStyles = (theme: Theme): TaskRowMenuStyles =>
  StyleSheet.create({
    menu: {
      marginTop: theme.spacing.space6,
      borderRadius: theme.borderRadius.radius12,
      backgroundColor: theme.colors.surface.lowest,
      borderWidth: HAIRLINE_WIDTH,
      borderColor: theme.colors.border.subtle,
      overflow: 'hidden',
      ...theme.shadows.level1,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: theme.spacing.space12,
      paddingVertical: theme.spacing.space12,
      paddingHorizontal: theme.spacing.space16,
    },
    divider: {
      height: HAIRLINE_WIDTH,
      marginHorizontal: theme.spacing.space16,
      backgroundColor: theme.colors.border.subtle,
    },
  });
