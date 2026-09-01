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
 * The modal card artboard B3 defines — radius 24, 24 pt padding, level-2 shadow — reused
 * here because this app draws one kind of modal and a second one would be a design decision
 * nobody made.
 */
export const makeExpiryPickerStyles = (theme: Theme): ExpiryPickerStyles =>
  StyleSheet.create({
    card: {
      alignSelf: 'stretch',
      backgroundColor: theme.colors.surface.lowest,
      borderRadius: theme.borderRadius.radius24,
      padding: theme.spacing.space24,
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
