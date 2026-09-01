import type { Theme } from '@ui/tokens';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface TaskDetailScreenStyles {
  readonly screen: ViewStyle;
}

/** The screen ground, which the empty frame after a delete also has to paint. */
export const makeTaskDetailScreenStyles = (theme: Theme): TaskDetailScreenStyles =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.surface.screen,
    },
  });
