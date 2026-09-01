import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface CalendarPreviewStyles {
  readonly card: ViewStyle;
  readonly weekdays: ViewStyle;
  readonly weekday: TextStyle;
  readonly weeks: ViewStyle;
  readonly week: ViewStyle;
  readonly cell: ViewStyle;
  readonly cellIdle: ViewStyle;
  readonly cellMarked: ViewStyle;
  readonly cellToday: ViewStyle;
}

/**
 * The canvas annotates this card as "drawn at 40% opacity so it reads as a preview rather
 * than a broken control". An opacity is not a design value with a scale behind it — there is
 * exactly one in the whole design — so it is a named constant here rather than a token.
 */
const PREVIEW_OPACITY = 0.4;

/**
 * Artboard C1's month grid. A white card at radius 20 with 20 pt of padding, seven equal
 * columns 10 pt apart, and 28 pt cells at radius 8.
 *
 * The cells are `flex: 1` rather than a computed width: the canvas draws them at 37.4 pt on
 * its 402 pt frame, which is not a design value but the remainder of dividing that frame by
 * seven. Letting flex do the division keeps the grid square on a narrower device.
 */
export const makeCalendarPreviewStyles = (theme: Theme): CalendarPreviewStyles =>
  StyleSheet.create({
    card: {
      opacity: PREVIEW_OPACITY,
      backgroundColor: theme.colors.surface.lowest,
      borderRadius: theme.borderRadius.radius20,
      padding: theme.spacing.space20,
      ...theme.shadows.level1,
    },
    weekdays: {
      flexDirection: 'row',
      columnGap: theme.spacing.space10,
    },
    weekday: {
      flex: 1,
      textAlign: 'center',
    },
    weeks: {
      marginTop: theme.spacing.space12,
      rowGap: theme.spacing.space10,
    },
    week: {
      flexDirection: 'row',
      columnGap: theme.spacing.space10,
    },
    cell: {
      flex: 1,
      height: theme.sizes.size28,
      borderRadius: theme.borderRadius.radius8,
    },
    cellIdle: {
      backgroundColor: theme.colors.surface.container,
    },
    cellMarked: {
      backgroundColor: theme.colors.primary.fixed,
    },
    cellToday: {
      backgroundColor: theme.colors.primary.container,
    },
  });
