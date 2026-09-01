import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface WelcomeScreenStyles {
  readonly screen: ViewStyle;
  readonly content: ViewStyle;
  readonly badge: ViewStyle;
  readonly title: TextStyle;
  readonly subtitle: TextStyle;
  readonly illustration: ViewStyle;
  readonly benefits: ViewStyle;
  readonly spacer: ViewStyle;
  readonly logIn: ViewStyle;
}

/**
 * Artboard A1. The canvas draws the content column at `8px 20px 34px` inside the safe areas;
 * the bottom 34 is the home-indicator inset and is applied from the real one at runtime, so
 * the screen sits correctly on a device that does not have the artboard's exact frame.
 *
 * `flexGrow: 1` on the scrolling content is what keeps the spacer honest: the call to action
 * stays pinned to the foot of the screen as it is drawn, and the column starts scrolling only
 * once the OS text size has grown the blocks past the frame.
 */
export const makeWelcomeScreenStyles = (theme: Theme): WelcomeScreenStyles =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.surface.screen,
    },
    content: {
      flexGrow: 1,
      paddingTop: theme.spacing.space8,
      paddingHorizontal: theme.spacing.space20,
    },
    badge: {
      alignSelf: 'flex-start',
      paddingVertical: theme.spacing.space6,
      paddingHorizontal: theme.spacing.space12,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary.fixed,
    },
    title: {
      marginTop: theme.spacing.space16,
    },
    subtitle: {
      marginTop: theme.spacing.space12,
    },
    illustration: {
      marginTop: theme.spacing.space24,
    },
    benefits: {
      marginTop: theme.spacing.space24,
      gap: theme.spacing.space8,
    },
    spacer: {
      flex: 1,
      minHeight: theme.spacing.space24,
    },
    logIn: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.space4,
      marginTop: theme.spacing.space14,
    },
  });
