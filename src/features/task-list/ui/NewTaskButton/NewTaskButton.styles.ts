import type { Theme } from '@ui/tokens';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface NewTaskButtonStyles {
  readonly button: ViewStyle;
}

/** Sheet D, "FAB": a 52 pt pill with 22 pt side padding, an 8 pt gap, and the level-2 shadow. */
export const makeNewTaskButtonStyles = (theme: Theme): NewTaskButtonStyles =>
  StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      columnGap: theme.spacing.space8,
      minHeight: theme.sizes.size52,
      paddingHorizontal: theme.spacing.space22,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary.base,
      ...theme.shadows.level2,
    },
  });
