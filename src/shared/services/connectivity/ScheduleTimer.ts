/**
 * "Run this later." Injected wherever a delay is part of a policy — the queue's retry
 * backoff and this service's own offline re-probe — so those policies are asserted by
 * reading the delay that was asked for, rather than by advancing a fake clock and hoping
 * the right timer fired.
 */
export type ScheduleTimer = (delayMs: number, run: () => void) => void;

/** The production implementation. */
export const scheduleWithTimeout: ScheduleTimer = (delayMs: number, run: () => void): void => {
  setTimeout(run, delayMs);
};
