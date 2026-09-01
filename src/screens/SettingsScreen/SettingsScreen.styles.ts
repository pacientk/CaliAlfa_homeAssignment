import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface SettingsScreenStyles {
  readonly screen: ViewStyle;
  readonly header: ViewStyle;
  readonly headerTitle: TextStyle;
  readonly scroll: ViewStyle;
  readonly content: ViewStyle;
  readonly account: ViewStyle;
  readonly avatar: ViewStyle;
  readonly sectionHeading: TextStyle;
  readonly preferences: ViewStyle;
  readonly signOut: ViewStyle;
  readonly signOutNote: TextStyle;
}

/**
 * Artboard C2. The task list's 52 pt navigation bar, then three cards down the 20 pt screen
 * column: the account, the preferences, and the one live control.
 *
 * `overflow: 'hidden'` on the preferences card is what makes the rows' own hairlines stop at
 * the corner radius instead of crossing it.
 *
 * `paddingBottom` is not on the canvas — the artboard is a fixed 874 pt frame where the
 * footnote ends well clear of the tab bar. It is here because this screen scrolls, and at the
 * theme's 130% text cap the footnote would otherwise finish flush against the bar.
 */
export const makeSettingsScreenStyles = (theme: Theme): SettingsScreenStyles =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.surface.screen,
    },
    header: {
      minHeight: theme.sizes.size52,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      textAlign: 'center',
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: theme.spacing.space20,
      paddingTop: theme.spacing.space8,
      paddingBottom: theme.spacing.space24,
    },
    account: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: theme.spacing.space16,
      padding: theme.spacing.space20,
      borderRadius: theme.borderRadius.radius20,
      backgroundColor: theme.colors.surface.lowest,
      ...theme.shadows.level1,
    },
    avatar: {
      width: theme.sizes.size52,
      height: theme.sizes.size52,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary.fixed,
    },
    sectionHeading: {
      marginTop: theme.spacing.space40,
    },
    preferences: {
      marginTop: theme.spacing.space8,
      borderRadius: theme.borderRadius.radius16,
      overflow: 'hidden',
      backgroundColor: theme.colors.surface.lowest,
      ...theme.shadows.level1,
    },
    signOut: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: theme.spacing.space14,
      marginTop: theme.spacing.space40,
      padding: theme.spacing.space16,
      borderRadius: theme.borderRadius.radius16,
      backgroundColor: theme.colors.surface.lowest,
      ...theme.shadows.level1,
    },
    signOutNote: {
      marginTop: theme.spacing.space16,
    },
  });
