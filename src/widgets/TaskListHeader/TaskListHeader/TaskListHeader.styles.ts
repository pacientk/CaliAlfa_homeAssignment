import type { Theme } from '@ui/tokens';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface TaskListHeaderStyles {
  readonly header: ViewStyle;
  readonly focusBlock: ViewStyle;
  readonly searchField: ViewStyle;
}

/**
 * Artboard B1 stacks these with a 16 pt column gap and then pulls the focus block up by 4,
 * so the gap above it is 12 and the gap below it is 16. Both are written out as margins here
 * rather than as a gap plus a negative offset — a negative margin that exists only to cancel
 * part of a gap is two rules where one will do.
 */
export const makeTaskListHeaderStyles = (theme: Theme): TaskListHeaderStyles =>
  StyleSheet.create({
    header: {
      paddingBottom: theme.spacing.space16,
    },
    focusBlock: {
      marginTop: theme.spacing.space12,
    },
    searchField: {
      marginTop: theme.spacing.space16,
    },
  });
