import type { Theme } from '@ui/tokens';
import type { TextStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface FieldLabelStyles {
  readonly label: TextStyle;
}

/** Artboards B6–B8 set every field label 8 pt above its control. */
export const makeFieldLabelStyles = (theme: Theme): FieldLabelStyles =>
  StyleSheet.create({
    label: {
      marginBottom: theme.spacing.space8,
    },
  });
