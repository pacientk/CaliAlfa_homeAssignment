import { useIsOnline, useLastSyncError, usePendingCount } from '@store/syncStore';
import { AppIcon, AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import { resolveSyncBanner } from './resolveSyncBanner';
import { makeSyncBannerStyles } from './SyncBanner.styles';

/**
 * FR-23: the app says when it is offline and when changes are still waiting.
 *
 * It takes no props and reads the sync store itself, through one selector hook per field, so
 * that a connectivity change re-renders a 36 pt band and not the list above it. A screen that
 * had to thread three values down to it would also have to re-render to do so.
 */
export const SyncBanner = (): JSX.Element | null => {
  const styles = useThemedStyles(makeSyncBannerStyles);
  const isOnline = useIsOnline();
  const pendingCount = usePendingCount();
  const lastError = useLastSyncError();

  const content = resolveSyncBanner(isOnline, pendingCount, lastError);

  if (content === undefined) {
    return null;
  }

  return (
    <AppView
      style={[styles.banner, styles.tone[content.tone]]}
      accessibilityRole="alert"
      accessibilityLabel={content.message}
      testID="taskList.syncBanner"
    >
      <AppIcon name={content.icon} size="size16" color={content.color} />
      <AppText variant="captionMedium" color={content.color}>
        {content.message}
      </AppText>
    </AppView>
  );
};
