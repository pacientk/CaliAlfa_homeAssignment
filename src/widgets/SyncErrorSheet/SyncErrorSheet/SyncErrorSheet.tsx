import { useRetryFirstSync } from '@features/task-sync';
import { strings } from '@lib/strings';
import { useFirstSyncError, useSetFirstSyncError } from '@store/syncStore';
import { AppBottomSheet, AppPressable, AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';
import { useState } from 'react';

import { makeSyncErrorSheetStyles } from './SyncErrorSheet.styles';

/**
 * What the app says when the first sync fails against a server that answered.
 *
 * It exists because that failure is otherwise completely silent. The queue's failures reach
 * the banner; a read that the server refused reaches nothing, connectivity still reports
 * online, and the list on screen is whatever the device had cached — which on a first run is
 * the same empty state as a genuinely empty account.
 *
 * Deliberately not a banner. The banner's states resolve on their own — a connection comes
 * back, a queue drains — and are worth a line of text at the top of a screen. This one does
 * not resolve on its own and asks the user to do something, so it takes the foreground.
 *
 * Takes no props and reads the store itself, for the reason `SyncBanner` gives: the screen
 * that renders it has nothing to do with the failure and should not re-render to pass it on.
 */
export const SyncErrorSheet = (): JSX.Element | null => {
  const styles = useThemedStyles(makeSyncErrorSheetStyles);
  const firstSyncError = useFirstSyncError();
  const setFirstSyncError = useSetFirstSyncError();
  const retryFirstSync = useRetryFirstSync();
  const [isRetrying, setIsRetrying] = useState(false);

  if (firstSyncError === undefined) {
    return null;
  }

  const dismiss = (): void => {
    setFirstSyncError(undefined);
  };

  const retry = (): void => {
    setIsRetrying(true);
    void retryFirstSync().finally(() => {
      // A retry that succeeded has already cleared the error and unmounted this, which
      // makes the write a no-op rather than a leak. A retry that failed again needs the
      // button back.
      setIsRetrying(false);
    });
  };

  return (
    <AppBottomSheet
      isVisible
      onRequestClose={dismiss}
      title={strings.syncErrorSheet.title}
      closeLabel={strings.syncErrorSheet.close}
      variant="picker"
      accessibilityLabel={strings.syncErrorSheet.title}
      testID="taskList.syncErrorSheet"
    >
      <AppView style={styles.card}>
        <AppText variant="body" color="secondary" style={styles.message}>
          {strings.syncErrorSheet.message[firstSyncError]}
        </AppText>

        <AppPressable
          onPress={retry}
          isDisabled={isRetrying}
          accessibilityRole="button"
          accessibilityLabel={strings.syncErrorSheet.retry}
          style={[styles.button, ...(isRetrying ? [styles.buttonDisabled] : [])]}
          testID="taskList.syncErrorSheet.retry"
        >
          <AppText variant="label" color="onPrimary">
            {isRetrying ? strings.syncErrorSheet.retrying : strings.syncErrorSheet.retry}
          </AppText>
        </AppPressable>
      </AppView>
    </AppBottomSheet>
  );
};
