import type { Theme } from '@ui/tokens';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface RootNavigatorStyles {
  readonly holding: ViewStyle;
}

/**
 * What a returning user sees for the fraction of a second before Firebase's auth listener
 * reports: the screen background and nothing on it. It is the design's own surface colour, so
 * the transition into whichever stack follows is a fade of content rather than of the page.
 */
export const makeRootNavigatorStyles = (theme: Theme): RootNavigatorStyles =>
  StyleSheet.create({
    holding: {
      flex: 1,
      backgroundColor: theme.colors.surface.screen,
    },
  });
