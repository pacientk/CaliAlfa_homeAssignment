import type { ApiFailure } from '@shared/api';

import type { ConnectivityService } from './ConnectivitySource';
import type { ScheduleTimer } from './ScheduleTimer';
import { scheduleWithTimeout } from './ScheduleTimer';

/**
 * How long the app waits after losing the network before spending one request to find out
 * whether it is back. Short enough that a user does not sit behind a stale banner, long enough
 * that a dead connection is not hammered.
 */
export const OFFLINE_PROBE_DELAY_MS = 5_000;

export interface OutcomeConnectivityOptions {
  scheduleTimer?: ScheduleTimer;
  probeDelayMs?: number;
}

/**
 * Connectivity derived from request outcomes rather than from the OS.
 *
 * The alternative was `@react-native-community/netinfo`, which is more accurate and notices a
 * change sooner. It was rejected here: it is a native module, its current releases target React
 * Native 0.83+ while this project is pinned to 0.80.3, and adding it would put a `pod install`
 * and a full `xcodebuild` on the critical path of the one task the offline claim rests on. What
 * this app needs to know is not "does the OS see an interface" but "did the last request reach
 * the server", and the requests answer that for free.
 *
 * The honest cost is a one-request delay before the first failure is noticed, and up to the
 * probe delay before a recovered network is believed. Neither can wedge the queue.
 *
 * **The belief and the permission to try are separate, and keeping them separate is the whole
 * point of this file.** An earlier version had one flag and flipped it back to "online" when the
 * probe timer fired, so that the drain would run. That made the banner wrong in the two states
 * it exists for: with an empty queue nothing failed again, so the app went on claiming to be
 * online while the device had no network at all; with a queue it flipped online, drained,
 * failed, and went offline again — every five seconds, for as long as the outage lasted. A probe
 * is a question, and answering it in advance is not the same as asking it.
 *
 * `server`, `client`, and `notFound` failures all prove the server was reached, so they report
 * *online* — a 500 is not a connectivity problem, and treating it as one would light the offline
 * banner for a healthy network.
 */
export const createOutcomeConnectivity = (
  options: OutcomeConnectivityOptions = {},
): ConnectivityService => {
  const scheduleTimer = options.scheduleTimer ?? scheduleWithTimeout;
  const probeDelayMs = options.probeDelayMs ?? OFFLINE_PROBE_DELAY_MS;

  // Optimistic at construction: with no evidence either way, refusing to try would mean never
  // producing the evidence.
  let isOnline = true;
  let isProbeDue = false;
  let isProbeScheduled = false;
  const listeners = new Set<() => void>();

  const publish = (isNextOnline: boolean, isNextProbeDue: boolean): void => {
    if (isOnline === isNextOnline && isProbeDue === isNextProbeDue) {
      return;
    }
    isOnline = isNextOnline;
    isProbeDue = isNextProbeDue;
    for (const listener of listeners) {
      listener();
    }
  };

  const scheduleProbe = (): void => {
    if (isProbeScheduled) {
      return;
    }
    isProbeScheduled = true;
    scheduleTimer(probeDelayMs, () => {
      isProbeScheduled = false;
      // Permission to make one attempt. Deliberately not a claim about the network: nothing has
      // happened since the failure that could justify one.
      publish(isOnline, true);
    });
  };

  const goOffline = (): void => {
    // The probe is spent, whether it was this attempt that failed or a queued write.
    publish(false, false);
    scheduleProbe();
  };

  return {
    getIsOnline: (): boolean => isOnline,

    getShouldAttempt: (): boolean => isOnline || isProbeDue,

    subscribe: (listener: () => void): (() => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    reportSuccess: (): void => {
      publish(true, false);
    },

    reportFailure: (failure: ApiFailure): void => {
      if (failure.kind === 'transport') {
        goOffline();
        return;
      }
      publish(true, false);
    },
  };
};
