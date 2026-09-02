import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface TaskListScreenStyles {
  readonly screen: ViewStyle;
  readonly header: ViewStyle;
  readonly headerTitle: TextStyle;
  readonly content: ViewStyle;
  readonly bannerSlot: ViewStyle;
  readonly listContent: ViewStyle;
  readonly rowSlot: ViewStyle;
  readonly emptyLayout: ViewStyle;
  readonly newTask: ViewStyle;
}

/**
 * Artboards B1–B5. A 52 pt navigation bar under the status inset, then the content column at
 * the design's 20 pt screen margin with 8 pt of air above the momentum card.
 *
 * The floating button sits 4 pt above the bottom of the content area. On the canvas that
 * reads as `bottom: 110` inside a frame whose tab bar is 106 tall — the same place, measured
 * from the frame instead of from the screen the tab navigator actually gives this component.
 *
 * `listContent` reserves 56 pt at the end of the scroll so the last row can be read with the
 * button over it: the button is 52 tall and floats 4 clear.
 */
export const makeTaskListScreenStyles = (theme: Theme): TaskListScreenStyles =>
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
    // The banner floats over the list instead of sitting in the column with it. In the flow
    // it pushed every row down the moment connectivity changed and pulled them back when it
    // cleared; a list should not jump because the radio blinked. It hangs from the bottom of
    // the header, and `box-none` lets taps through everywhere it is not drawn.
    bannerSlot: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'stretch',
    },
    // Deliberately no horizontal padding. The scroll view has to reach the screen's edges,
    // because iOS draws the scroll indicator against the inside of its own frame — inset the
    // frame and the indicator floats over the rows instead of sitting at the edge of the
    // display. The 20 pt margin therefore lives on the scrolling *content*, below, and on the
    // empty layout, which is the same margin in a container that does not scroll.
    content: {
      flex: 1,
      paddingTop: theme.spacing.space8,
    },
    listContent: {
      paddingHorizontal: theme.spacing.space20,
      paddingBottom: theme.spacing.space56,
    },
    rowSlot: {
      paddingBottom: theme.spacing.space8,
    },
    emptyLayout: {
      flex: 1,
      paddingHorizontal: theme.spacing.space20,
    },
    newTask: {
      position: 'absolute',
      right: theme.spacing.space20,
      bottom: theme.spacing.space4,
    },
  });
