import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface CalendarScreenStyles {
  readonly screen: ViewStyle;
  readonly header: ViewStyle;
  readonly headerTitle: TextStyle;
  readonly scroll: ViewStyle;
  readonly content: ViewStyle;
  readonly badge: ViewStyle;
  readonly preview: ViewStyle;
  readonly heading: TextStyle;
  readonly body: TextStyle;
  readonly backAction: ViewStyle;
}

/**
 * Artboard C1. The same 52 pt navigation bar the task list draws, then the content column at
 * the design's 20 pt screen margin with 8 pt of air above the badge.
 *
 * The badge is `alignSelf: 'flex-start'` because the canvas draws it as a pill that hugs its
 * own words; a row that filled the column would read as a banner instead.
 *
 * `paddingBottom` is not on the canvas — the artboard is a fixed 874 pt frame where the copy
 * ends well clear of the tab bar. It is here because this screen scrolls, and at the theme's
 * 130% text cap the last line would otherwise finish flush against the bar.
 */
/** The outline the canvas draws on the neutral action, matching the empty-state button. */
const OUTLINE_BORDER_WIDTH = 1;

export const makeCalendarScreenStyles = (theme: Theme): CalendarScreenStyles =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.surface.screen,
    },
    header: {
      minHeight: theme.sizes.size52,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      textAlign: 'center',
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: theme.spacing.space20,
      paddingTop: theme.spacing.space8,
      paddingBottom: theme.spacing.space24,
    },
    backAction: {
      marginTop: theme.spacing.space24,
      height: theme.sizes.size48,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'stretch',
      borderRadius: theme.borderRadius.full,
      borderWidth: OUTLINE_BORDER_WIDTH,
      borderColor: theme.colors.primary.base,
    },
    badge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: theme.spacing.space8,
      paddingVertical: theme.spacing.space10,
      paddingHorizontal: theme.spacing.space14,
      borderRadius: theme.borderRadius.radius12,
      backgroundColor: theme.colors.primary.fixed,
    },
    preview: {
      marginTop: theme.spacing.space40,
    },
    heading: {
      marginTop: theme.spacing.space40,
    },
    body: {
      marginTop: theme.spacing.space8,
    },
  });
