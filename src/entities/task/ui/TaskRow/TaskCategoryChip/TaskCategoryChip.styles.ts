import type { Theme } from '@ui/tokens';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface TaskCategoryChipStyles {
  readonly chip: ViewStyle;
  readonly chipDefault: ViewStyle;
  readonly chipExpired: ViewStyle;
}

/** Sheet D, "CATEGORY CHIP": 4 × 10 padding, a full pill, one fill per row state. */
export const makeTaskCategoryChipStyles = (theme: Theme): TaskCategoryChipStyles =>
  StyleSheet.create({
    chip: {
      flexShrink: 0,
      paddingVertical: theme.spacing.space4,
      paddingHorizontal: theme.spacing.space10,
      borderRadius: theme.borderRadius.full,
    },
    chipDefault: {
      backgroundColor: theme.colors.surface.containerHigh,
    },
    chipExpired: {
      backgroundColor: theme.colors.surface.containerHighest,
    },
  });
