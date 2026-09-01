import type { Theme } from '@ui/tokens';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface TaskFormStyles {
  readonly screen: ViewStyle;
  readonly scroll: ViewStyle;
  readonly content: ViewStyle;
  readonly spacer: ViewStyle;
  readonly metadata: ViewStyle;
}

/**
 * Artboards B6–B8: a 52 pt bar, then a content column at the 20 pt screen margin, 16 pt
 * under the bar, with 24 pt between blocks and the actions pinned to the bottom.
 *
 * The 24 is a `rowGap` on the column rather than a `marginTop` on each block, which is what
 * keeps the *first* block 16 pt under the bar on both screens even though it is the title
 * field on one and the completion card on the other.
 *
 * `flexGrow: 1` plus the spacer is how the canvas's `flex: 1` filler is expressed inside a
 * scroll view: the actions sit at the bottom of a short form and are pushed below the fold
 * by a long one, rather than floating over the content.
 */
export const makeTaskFormStyles = (theme: Theme): TaskFormStyles =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.surface.screen,
    },
    scroll: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      rowGap: theme.spacing.space24,
      paddingTop: theme.spacing.space16,
      paddingHorizontal: theme.spacing.space20,
    },
    spacer: {
      flexGrow: 1,
    },
    // The expiry field and the metadata under it are one block, 16 pt apart, so that the
    // column's 24 pt rhythm applies between blocks and not inside this one.
    metadata: {
      rowGap: theme.spacing.space0,
    },
  });
