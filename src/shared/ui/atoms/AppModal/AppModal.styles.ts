import type { Theme } from '@ui/tokens';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface AppModalStyles {
  readonly scrim: ViewStyle;
}

/**
 * Artboard B3: "Scrim #1c1a23 at 40%", drawn across the whole frame — the tab bar included.
 * That last part is why this is a native modal window rather than an absolutely positioned
 * overlay inside the screen: a screen inside the tab navigator ends where the bar begins, so
 * an in-screen overlay would leave the bar lit under a dimmed page.
 *
 * The 40 % lives in the scrim colour token rather than in an `opacity` here, because opacity
 * applies to a layer and would fade the dialog standing on it too.
 */
export const makeAppModalStyles = (theme: Theme): AppModalStyles =>
  StyleSheet.create({
    scrim: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.scrim,
      paddingHorizontal: theme.spacing.space40,
    },
  });
