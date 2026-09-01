import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface ResendActionStyles {
  readonly waiting: TextStyle;
  readonly offer: ViewStyle;
}

/**
 * Artboards A3 and A4 draw the same slot in two states, 24 pt under the code row: a muted
 * countdown while the minute runs, and a prompt beside a brand-coloured action once it does
 * not.
 */
export const makeResendActionStyles = (theme: Theme): ResendActionStyles =>
  StyleSheet.create({
    waiting: {
      marginTop: theme.spacing.space24,
      textAlign: 'center',
    },
    offer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.space4,
      marginTop: theme.spacing.space24,
    },
  });
