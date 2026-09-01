import { strings } from '@lib/strings';
import type { SyncErrorKind } from '@store/syncStore';
import type { IconName, TextColorRole } from '@ui/atoms';

export type SyncBannerTone = 'offline' | 'pending' | 'error';

export interface SyncBannerContent {
  readonly tone: SyncBannerTone;
  readonly icon: IconName;
  readonly color: TextColorRole;
  readonly message: string;
}

/**
 * What the banner says, or nothing at all.
 *
 * Precedence, and why it is this order: a device with no connection is the *reason* for
 * everything else on the list, so it is announced first; a failure the queue gave up on is
 * next, because it is the only state the user may have to act on; and "still syncing" is
 * last, because it resolves on its own. Reporting two of them at once would be three lines
 * of banner over a screen that has 657 pt of content.
 *
 * The wording is chosen here, from a failure *kind*, rather than in `syncStore` — copy
 * belongs in `shared/lib/strings.ts`, and a store that held sentences could not be asserted
 * without asserting English.
 */
export const resolveSyncBanner = (
  isOnline: boolean,
  pendingCount: number,
  lastError?: SyncErrorKind,
): SyncBannerContent | undefined => {
  if (!isOnline) {
    return {
      tone: 'offline',
      icon: 'cloud_off',
      color: 'secondary',
      message: strings.syncBanner.offline,
    };
  }

  if (lastError !== undefined) {
    return {
      tone: 'error',
      icon: 'error',
      color: 'onErrorContainer',
      message: strings.syncBanner.error[lastError],
    };
  }

  if (pendingCount > 0) {
    return {
      tone: 'pending',
      icon: 'sync',
      color: 'accent',
      message: strings.syncBanner.pending(pendingCount),
    };
  }

  return undefined;
};
