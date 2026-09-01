import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface TaskListScreenStyles {
  readonly screen: ViewStyle;
  readonly header: ViewStyle;
  readonly headerTitle: TextStyle;
  readonly content: ViewStyle;
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
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.space20,
      paddingTop: theme.spacing.space8,
    },
    listContent: {
      paddingBottom: theme.spacing.space56,
    },
    rowSlot: {
      paddingBottom: theme.spacing.space8,
    },
    emptyLayout: {
      flex: 1,
    },
    newTask: {
      position: 'absolute',
      right: theme.spacing.space20,
      bottom: theme.spacing.space4,
    },
  });
