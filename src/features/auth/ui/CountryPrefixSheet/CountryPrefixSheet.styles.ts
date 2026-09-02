import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';

export interface CountryPrefixSheetStyles {
  readonly list: ViewStyle;
  readonly row: ViewStyle;
  readonly rowSelected: ViewStyle;
  readonly rowPressed: ViewStyle;
  readonly rowDivider: ViewStyle;
  readonly iso: TextStyle;
  readonly country: TextStyle;
  readonly check: ViewStyle;
}

/**
 * Artboard A6's list, inside the sheet chrome the atom draws.
 *
 * The list window is a fixed 397 and only the list scrolls. That is deliberate on two counts:
 * the sheet's own height then falls out of its parts rather than being declared, and nested
 * scrolling — a draggable sheet containing a scrollable list — is a fight the platform does not
 * let you win.
 *
 * 397 is derived, not chosen: seven full rows at 52 with their dividers, plus 26, so row eight
 * is bisected by the sheet's bottom edge. A row cut in half is the cheapest possible "there is
 * more below", and the platform's own scroll indicator carries the rest.
 */
export const makeCountryPrefixSheetStyles = (theme: Theme): CountryPrefixSheetStyles => ({
  list: {
    height: LIST_WINDOW_HEIGHT,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: theme.spacing.space12,
    minHeight: theme.sizes.size52,
    paddingVertical: theme.spacing.space8,
    paddingLeft: theme.spacing.space20,
    paddingRight: theme.spacing.space16,
    backgroundColor: theme.colors.surface.lowest,
  },
  rowSelected: {
    backgroundColor: theme.colors.primary.fixed,
  },
  rowPressed: {
    backgroundColor: theme.colors.surface.container,
  },
  rowDivider: {
    borderTopWidth: DIVIDER_WIDTH,
    borderTopColor: theme.colors.surface.container,
    // The divider starts where the ISO column does, so the list has a single left edge.
    marginLeft: theme.spacing.space20,
  },
  iso: {
    width: ISO_COLUMN_WIDTH,
  },
  country: {
    flex: 1,
  },
  check: {
    width: CHECK_COLUMN_WIDTH,
    alignItems: 'flex-end',
  },
});

/**
 * Seven rows and their dividers plus 26, so the eighth is cut by the sheet's edge.
 * Component-scoped rather than a theme rung: no other surface in the app is this tall, and
 * `principles.md § Sizing` reserves component tokens for exactly that case.
 */
const LIST_WINDOW_HEIGHT = 397;

/** Wide enough for the widest two-letter code in overline type, and fixed so names align. */
const ISO_COLUMN_WIDTH = 28;

/** A fixed column, so the dial codes line up whether or not a row carries the tick. */
const CHECK_COLUMN_WIDTH = 24;

const DIVIDER_WIDTH = 1;
