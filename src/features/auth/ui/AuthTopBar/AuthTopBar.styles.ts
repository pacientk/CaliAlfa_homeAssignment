import type { Theme } from '@ui/tokens';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface AuthTopBarStyles {
  readonly bar: ViewStyle;
}

/**
 * Artboards A2–A5: a 52 pt bar under the status inset holding one back arrow at the design's
 * 20 pt screen margin. The arrow's own touch target comes from `AppPressable`'s hit slop, so
 * nothing here inflates it to reach the 44 pt floor.
 */
export const makeAuthTopBarStyles = (theme: Theme): AuthTopBarStyles =>
  StyleSheet.create({
    bar: {
      minHeight: theme.sizes.size52,
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingHorizontal: theme.spacing.space20,
    },
  });
