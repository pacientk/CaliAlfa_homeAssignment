import type { ApiFailure } from '@shared/api';

import type { ConnectivityService } from './ConnectivitySource';
import type { ScheduleTimer } from './ScheduleTimer';
import { scheduleWithTimeout } from './ScheduleTimer';

/**
 * How long a transport failure is believed before the service optimistically reports
 * itself online again so the queue will probe. Short enough that the user does not sit
 * behind a stale banner, long enough that a dead network is not hammered.
 */
export const OFFLINE_PROBE_DELAY_MS = 5_000;

export interface OutcomeConnectivityOptions {
  scheduleTimer?: ScheduleTimer;
  probeDelayMs?: number;
}

/**
 * Connectivity derived from request outcomes rather than from the OS.
 *
 * The alternative was `@react-native-community/netinfo`, which is more accurate and
 * notices a change sooner. It was rejected here: it is a native module, its current
 * releases target React Native 0.83+ while this project is pinned to 0.80.3, and adding
 * it would put a `pod install` and a full `xcodebuild` on the critical path of the one
 * task the offline claim rests on. What this app actually needs to know is not "does the
 * OS see an interface" but "did the last request reach the server", and that question is
 * answered by the requests themselves, for free and without a device.
 *
 * The honest cost is a one-request delay before the first failure is noticed, and a
 * five-second window in which a recovered network is still reported as offline. Both are
 * self-correcting; neither can wedge the queue, because going offline schedules the probe
 * that brings the state back.
 *
 * `server`, `client`, and `notFound` failures all prove the server was reached, so they
 * report *online* — a 500 is not a connectivity problem, and treating it as one would
 * light the offline banner for a healthy network.
 */
export const createOutcomeConnectivity = (
  options: OutcomeConnectivityOptions = {},
): ConnectivityService => {
  const scheduleTimer = options.scheduleTimer ?? scheduleWithTimeout;
  const probeDelayMs = options.probeDelayMs ?? OFFLINE_PROBE_DELAY_MS;

  // Optimistic at construction: with no evidence either way, refusing to try would mean
  // never producing the evidence.
  let isOnline = true;
  let isProbeScheduled = false;
  const listeners = new Set<() => void>();

  const setIsOnline = (isNextOnline: boolean): void => {
    if (isOnline === isNextOnline) {
      return;
    }
    isOnline = isNextOnline;
    for (const listener of listeners) {
      listener();
    }
  };

  const goOffline = (): void => {
    setIsOnline(false);
    if (isProbeScheduled) {
      return;
    }
    isProbeScheduled = true;
    scheduleTimer(probeDelayMs, () => {
      isProbeScheduled = false;
      setIsOnline(true);
    });
  };

  return {
    getIsOnline: (): boolean => isOnline,

    subscribe: (listener: () => void): (() => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    reportSuccess: (): void => {
      setIsOnline(true);
    },

    reportFailure: (failure: ApiFailure): void => {
      if (failure.kind === 'offline' || failure.kind === 'transport') {
        goOffline();
        return;
      }
      setIsOnline(true);
    },
  };
};
