import type { ApiFailure } from '@shared/api';
import { isRetryableFailure } from '@shared/api';

import type { MutationKind } from './QueuedMutation';

/** The wait after the first failed attempt. Every further attempt doubles it. */
export const RETRY_BASE_DELAY_MS = 1_000;

/** The ceiling. Without it, a long outage would schedule the next attempt days out. */
export const RETRY_MAX_DELAY_MS = 60_000;

const BACKOFF_FACTOR = 2;

/**
 * Exponential backoff with a ceiling: 1s, 2s, 4s, 8s … 60s.
 *
 * An attempt count of zero or less is clamped to the base delay rather than trusted —
 * `Math.pow` of a negative exponent would otherwise schedule a retry in under a
 * millisecond and spin.
 */
export const backoffDelayMs = (attempts: number): number => {
  if (attempts <= 1) {
    return RETRY_BASE_DELAY_MS;
  }
  const delayMs = RETRY_BASE_DELAY_MS * BACKOFF_FACTOR ** (attempts - 1);
  return Math.min(delayMs, RETRY_MAX_DELAY_MS);
};

/**
 * What the drain does with a failed head entry.
 *
 * - `retry` — leave it at the head, count the attempt, come back later.
 * - `discardMissing` — the record is gone server-side; drop the entry and the local copy,
 *   silently. This is not a failure the user needs to see.
 * - `terminal` — the request itself is wrong; drop the entry, roll the change back, and
 *   surface it once.
 */
export type DrainOutcome = 'retry' | 'discardMissing' | 'terminal';

/**
 * The classification is not re-derived here: `isRetryableFailure` from `@shared/api` owns
 * it, and duplicating the status ranges is how the two would drift apart.
 *
 * A 404 on a create is the one case that does not follow the kind alone: the collection
 * endpoint cannot be missing, so it is a genuine fault rather than a vanished record.
 */
export const classifyDrainFailure = (failure: ApiFailure, kind: MutationKind): DrainOutcome => {
  if (isRetryableFailure(failure)) {
    return 'retry';
  }
  if (failure.kind === 'notFound' && kind !== 'create') {
    return 'discardMissing';
  }
  return 'terminal';
};
