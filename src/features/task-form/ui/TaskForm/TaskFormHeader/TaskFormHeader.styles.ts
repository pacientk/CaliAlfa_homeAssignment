import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface TaskFormHeaderStyles {
  readonly header: ViewStyle;
  readonly title: TextStyle;
}

/**
 * Artboards B6–B8: a 52 pt bar with the back arrow at the 20 pt screen margin and the title
 * centred on the *frame*, not on the space left over beside the arrow.
 *
 * That is why the title is absolutely positioned and `pointerEvents`-transparent rather than
 * being a flex child: a centred flex child shifts right by half the arrow's width, which is
 * visible the moment the two screens are compared side by side.
 */
export const makeTaskFormHeaderStyles = (theme: Theme): TaskFormHeaderStyles =>
  StyleSheet.create({
    header: {
      minHeight: theme.sizes.size52,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.space20,
    },
    title: {
      position: 'absolute',
      left: theme.spacing.space0,
      right: theme.spacing.space0,
      textAlign: 'center',
    },
  });
