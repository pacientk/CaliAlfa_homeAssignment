import type { Theme } from '@ui/tokens';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface FormChipStyles {
  readonly chip: ViewStyle;
  readonly chipSelected: ViewStyle;
  readonly chipUnselected: ViewStyle;
}

/**
 * Artboards B6–B8: an 8 × 14 pill, filled with the brand colour when it is the chosen value
 * and with `containerHigh` when it is merely on offer.
 *
 * Not `entities/task`'s `TaskCategoryChip`: that chip is a 4 × 10 read-only label on a list
 * row with an expired variant; this one is an 8 × 14 two-state control. They share a shape
 * and nothing else — `principles.md § DRY` is about knowledge, not about silhouette.
 */
export const makeFormChipStyles = (theme: Theme): FormChipStyles =>
  StyleSheet.create({
    chip: {
      paddingVertical: theme.spacing.space8,
      paddingHorizontal: theme.spacing.space14,
      borderRadius: theme.borderRadius.full,
    },
    chipSelected: {
      backgroundColor: theme.colors.primary.base,
    },
    chipUnselected: {
      backgroundColor: theme.colors.surface.containerHigh,
    },
  });
