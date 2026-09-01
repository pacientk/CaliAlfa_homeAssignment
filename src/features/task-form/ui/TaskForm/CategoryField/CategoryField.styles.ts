import type { Theme } from '@ui/tokens';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface CategoryFieldStyles {
  readonly chips: ViewStyle;
  readonly newChip: ViewStyle;
  readonly input: ViewStyle;
}

/** The dashed edge artboard B6 draws around the "New category" chip. */
const DASHED_BORDER_WIDTH = 1;

/** Artboards B6–B8: chips wrap at 8 pt in both directions; the field below them clears 12. */
export const makeCategoryFieldStyles = (theme: Theme): CategoryFieldStyles =>
  StyleSheet.create({
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: theme.spacing.space8,
      rowGap: theme.spacing.space8,
    },
    newChip: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: theme.spacing.space4,
      paddingVertical: theme.spacing.space8,
      paddingHorizontal: theme.spacing.space14,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.surface.screen,
      borderWidth: DASHED_BORDER_WIDTH,
      borderStyle: 'dashed',
      borderColor: theme.colors.border.base,
    },
    input: {
      marginTop: theme.spacing.space12,
    },
  });
