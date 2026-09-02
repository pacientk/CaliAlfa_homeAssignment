import type { Theme } from '@ui/tokens';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

import type { SyncBannerTone } from './resolveSyncBanner';

export interface SyncBannerStyles {
  readonly banner: ViewStyle;
  readonly tone: Record<SyncBannerTone, ViewStyle>;
}

/**
 * Sheet D's band, drawn as an overlay rather than as a row in the layout.
 *
 * In the flow it pushed the whole page down the moment connectivity changed, and pulled it
 * back up again when it cleared — a list that jumps under the reader's eye because the radio
 * blinked. The screen positions it absolutely below the header now, so the content beneath
 * never moves, and the band gets a level-1 shadow because a strip floating over a list needs
 * an edge the list does not give it.
 *
 * Its content is centred, which a full-bleed row did not need and a floating band does.
 */
export const makeSyncBannerStyles = (theme: Theme): SyncBannerStyles => ({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: theme.spacing.space8,
    paddingVertical: theme.spacing.space8,
    paddingHorizontal: theme.spacing.space20,
    ...theme.shadows.level1,
  },
  tone: StyleSheet.create({
    // Neutral behind both, so the text colour is what says which state this is.
    offline: { backgroundColor: theme.colors.surface.lowest },
    pending: { backgroundColor: theme.colors.surface.lowest },
    error: { backgroundColor: theme.colors.feedback.errorContainer },
  }),
});
