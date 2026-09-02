import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';

export interface CountryPrefixModalStyles {
  readonly card: ViewStyle;
  readonly title: TextStyle;
  readonly list: ViewStyle;
  readonly row: ViewStyle;
  readonly rowSelected: ViewStyle;
  readonly rowDivider: ViewStyle;
  readonly country: TextStyle;
  readonly dialCode: TextStyle;
  readonly check: ViewStyle;
}

/**
 * The dialog card artboard B3 defines — radius 24 on the app's surface — carrying a list
 * rather than a pair of buttons. The card is capped in height and the list scrolls inside
 * it, because fifteen rows at 52 pt is taller than the modal should ever be.
 */
export const makeCountryPrefixModalStyles = (theme: Theme): CountryPrefixModalStyles => ({
  card: {
    // Stretch inside AppModal's 40 pt gutters, the way the delete dialog does. Without it the
    // card sizes to its content, and the content is a column of country names — which then
    // wrap mid-word, so "United Kingdom" comes out as three lines.
    alignSelf: 'stretch',
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.borderRadius.radius24,
    paddingVertical: theme.spacing.space8,
    overflow: 'hidden',
    ...theme.shadows.level2,
  },
  title: {
    paddingHorizontal: theme.spacing.space20,
    paddingTop: theme.spacing.space12,
    paddingBottom: theme.spacing.space8,
  },
  list: {
    maxHeight: MAX_LIST_HEIGHT,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: theme.sizes.size52,
    paddingHorizontal: theme.spacing.space20,
  },
  rowSelected: {
    backgroundColor: theme.colors.primary.fixed,
  },
  rowDivider: {
    borderTopWidth: DIVIDER_WIDTH,
    borderTopColor: theme.colors.surface.container,
  },
  country: {
    flex: 1,
  },
  check: {
    width: CHECK_COLUMN_WIDTH,
    alignItems: 'flex-end',
  },
  dialCode: {
    marginLeft: theme.spacing.space16,
  },
});

/** Four rows and a bit, so the list is visibly scrollable rather than looking complete. */
const MAX_LIST_HEIGHT = 320;

const DIVIDER_WIDTH = 1;

/** A fixed column so the dial codes line up whether or not a row carries the tick. */
const CHECK_COLUMN_WIDTH = 24;
