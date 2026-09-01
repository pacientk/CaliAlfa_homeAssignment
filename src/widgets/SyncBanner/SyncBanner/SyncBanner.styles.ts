import type { Theme } from '@ui/tokens';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

import type { SyncBannerTone } from './resolveSyncBanner';

export interface SyncBannerStyles {
  readonly banner: ViewStyle;
  readonly tone: Record<SyncBannerTone, ViewStyle>;
}

/**
 * Sheet D, "OFFLINE / SYNCING BANNER · SITS BETWEEN HEADER AND CONTENT": a full-bleed band,
 * 8 pt tall on each side of the text and inset to the 20 pt screen margin.
 *
 * It is drawn without a corner radius, as the in-frame example on the sheet shows. The
 * standalone sample beside it has a radius because it is floating on the sheet's white page,
 * not because the band is rounded in the app.
 */
export const makeSyncBannerStyles = (theme: Theme): SyncBannerStyles => ({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: theme.spacing.space8,
    paddingVertical: theme.spacing.space8,
    paddingHorizontal: theme.spacing.space20,
  },
  tone: StyleSheet.create({
    offline: { backgroundColor: theme.colors.surface.containerHighest },
    pending: { backgroundColor: theme.colors.primary.fixed },
    error: { backgroundColor: theme.colors.feedback.errorContainer },
  }),
});
