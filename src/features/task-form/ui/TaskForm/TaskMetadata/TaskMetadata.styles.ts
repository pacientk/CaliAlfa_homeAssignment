import type { Theme } from '@ui/tokens';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface TaskMetadataStyles {
  readonly row: ViewStyle;
}

/** Artboard B8: two label-over-value columns 24 pt apart, 16 pt under the expiry field. */
export const makeTaskMetadataStyles = (theme: Theme): TaskMetadataStyles =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: theme.spacing.space24,
      rowGap: theme.spacing.space8,
      marginTop: theme.spacing.space16,
    },
  });
