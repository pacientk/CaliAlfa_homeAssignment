import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface MomentumCardStyles {
  readonly card: ViewStyle;
  readonly subtitle: TextStyle;
  readonly track: ViewStyle;
  readonly fill: ViewStyle;
}

/**
 * Sheet D, "PROGRESS CARD": a filled brand panel, radius 20, 20 pt padding, with an 8 pt
 * pill track 12 pt under the copy.
 *
 * The fill's *width* is not here. It is a percentage derived from the counts at render time,
 * which is the one case `docs/architecture/coding-rules.md § No inline styles` allows to be
 * an inline object — everything about the fill that is not its width is a token, and lives
 * in this file.
 */
export const makeMomentumCardStyles = (theme: Theme): MomentumCardStyles =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.primary.container,
      borderRadius: theme.borderRadius.radius20,
      padding: theme.spacing.space20,
      rowGap: theme.spacing.space12,
    },
    subtitle: {
      marginTop: theme.spacing.space2,
    },
    track: {
      height: theme.sizes.size8,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary.muted,
      overflow: 'hidden',
    },
    fill: {
      height: theme.sizes.size8,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary.onBase,
    },
  });
