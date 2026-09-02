import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface ExpiryPickerStyles {
  readonly card: ViewStyle;
  readonly section: ViewStyle;
  readonly chips: ViewStyle;
  readonly actions: ViewStyle;
  readonly button: ViewStyle;
  readonly buttonNever: ViewStyle;
  readonly buttonConfirm: ViewStyle;
  readonly title: TextStyle;
}

/**
 * The body inside the sheet's chrome. The sheet draws the surface, the top corners, the
 * shadow and the header, so what is left here is the body's own inset and its sections.
 *
 * The title moved into that header, which is why there is no heading in this file any more:
 * two headings, one per component, is how a shared shell stops being shared.
 */
export const makeExpiryPickerStyles = (theme: Theme): ExpiryPickerStyles =>
  StyleSheet.create({
    card: {
      paddingHorizontal: theme.spacing.space20,
      paddingTop: theme.spacing.space16,
      ...theme.shadows.level2,
    },
    title: {
      marginBottom: theme.spacing.space16,
    },
    section: {
      marginBottom: theme.spacing.space16,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: theme.spacing.space8,
      rowGap: theme.spacing.space8,
    },
    actions: {
      flexDirection: 'row',
      columnGap: theme.spacing.space12,
      marginTop: theme.spacing.space8,
    },
    button: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: theme.sizes.size48,
      borderRadius: theme.borderRadius.full,
    },
    buttonNever: {
      backgroundColor: theme.colors.surface.container,
    },
    buttonConfirm: {
      backgroundColor: theme.colors.primary.base,
    },
  });
