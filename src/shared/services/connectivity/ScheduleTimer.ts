/**
 * "Run this later." Injected wherever a delay is part of a policy — the queue's retry
 * backoff and this service's own offline re-probe — so those policies are asserted by
 * reading the delay that was asked for, rather than by advancing a fake clock and hoping
 * the right timer fired.
 */
export type ScheduleTimer = (delayMs: number, run: () => void) => CancelTimer;

/**
 * Calls off a scheduled run. Safe to call after it has already fired, and safe to call twice —
 * whoever holds one should be able to use it from a teardown path without first proving the
 * timer is still pending.
 */
export type CancelTimer = () => void;

/** The production implementation. */
export const scheduleWithTimeout: ScheduleTimer = (
  delayMs: number,
  run: () => void,
): CancelTimer => {
  const handle = setTimeout(run, delayMs);
  return () => {
    clearTimeout(handle);
  };
};
