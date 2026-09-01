import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface TaskRowStyles {
  readonly card: ViewStyle;
  readonly cardDefault: ViewStyle;
  readonly cardExpired: ViewStyle;
  readonly cardMenuOpen: ViewStyle;
  readonly title: TextStyle;
  readonly titleCompleted: TextStyle;
  readonly actions: ViewStyle;
  readonly actionsMenuOpen: ViewStyle;
}

/**
 * The resting card carries a 1 pt border in its own background colour. That is not decoration
 * — it is what stops the card from changing size when the menu-open state swaps it for a 2 pt
 * brand edge, which the canvas draws as an inset outline.
 */
const CARD_BORDER_WIDTH = 1;
const CARD_MENU_OPEN_BORDER_WIDTH = 2;

/**
 * `TaskRow.dc.html`, read state by state. The card is 14 pt tall on three sides and 16 pt on
 * the leading one, radius 16, and never shorter than 56.
 *
 * `minHeight` rather than `height`, per `docs/architecture/principles.md § Sizing`: the row
 * holds a title, so it has to grow with the OS text size instead of clipping it. The 56 the
 * canvas draws is the floor.
 */
export const makeTaskRowStyles = (theme: Theme): TaskRowStyles =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: theme.spacing.space12,
      minHeight: theme.sizes.size56,
      paddingVertical: theme.spacing.space14,
      paddingLeft: theme.spacing.space16,
      paddingRight: theme.spacing.space14,
      borderRadius: theme.borderRadius.radius16,
      borderWidth: CARD_BORDER_WIDTH,
    },
    cardDefault: {
      backgroundColor: theme.colors.surface.lowest,
      borderColor: theme.colors.surface.lowest,
      ...theme.shadows.level1,
    },
    // No shadow key at all rather than a zeroed one: the two fills are mutually exclusive, so
    // an expired card never has a level-1 shadow to cancel.
    cardExpired: {
      backgroundColor: theme.colors.surface.container,
      borderColor: theme.colors.border.muted,
    },
    cardMenuOpen: {
      borderWidth: CARD_MENU_OPEN_BORDER_WIDTH,
      borderColor: theme.colors.primary.base,
    },
    title: {
      flex: 1,
    },
    titleCompleted: {
      textDecorationLine: 'line-through',
    },
    actions: {
      width: theme.sizes.size28,
      height: theme.sizes.size28,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.full,
    },
    actionsMenuOpen: {
      backgroundColor: theme.colors.primary.fixed,
    },
  });
