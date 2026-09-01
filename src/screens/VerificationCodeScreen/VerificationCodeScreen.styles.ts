import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface VerificationCodeScreenStyles {
  readonly screen: ViewStyle;
  readonly content: ViewStyle;
  readonly tile: ViewStyle;
  readonly tileResting: ViewStyle;
  readonly tileError: ViewStyle;
  readonly title: TextStyle;
  readonly sentTo: TextStyle;
  readonly codeRow: ViewStyle;
  readonly message: ViewStyle;
  readonly messageText: TextStyle;
  readonly spacer: ViewStyle;
}

/**
 * Artboards A3, A4 and A5. The three differ in two places only — the tile at the top and the
 * palette of the code row — so the layout below is written once and the state picks a fill.
 *
 * The tile is `width`/`height` rather than `minHeight`: it holds a glyph, and
 * `docs/architecture/principles.md § Sizing` keeps icon geometry raw when the OS text size
 * grows. The message beneath the row sits 8 pt under it, as A5 annotates.
 */
export const makeVerificationCodeScreenStyles = (theme: Theme): VerificationCodeScreenStyles =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.surface.screen,
    },
    content: {
      flexGrow: 1,
      paddingTop: theme.spacing.space16,
      paddingHorizontal: theme.spacing.space20,
    },
    tile: {
      width: theme.sizes.size56,
      height: theme.sizes.size56,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.radius20,
    },
    tileResting: {
      backgroundColor: theme.colors.primary.fixed,
    },
    tileError: {
      backgroundColor: theme.colors.feedback.errorContainer,
    },
    title: {
      marginTop: theme.spacing.space20,
    },
    sentTo: {
      marginTop: theme.spacing.space12,
    },
    codeRow: {
      marginTop: theme.spacing.space40,
    },
    message: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.space6,
      marginTop: theme.spacing.space8,
    },
    messageText: {
      flex: 1,
    },
    spacer: {
      flex: 1,
      minHeight: theme.spacing.space24,
    },
  });
