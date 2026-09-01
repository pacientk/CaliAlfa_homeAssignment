import { useEffect, useState } from 'react';

/** FR-4: the resend action is locked for a minute after a code is sent. */
const RESEND_COUNTDOWN_SECONDS = 60;
const ONE_SECOND_MS = 1_000;
const COUNTDOWN_FINISHED = 0;

export interface ResendCountdown {
  /** What the "Resend code in 0:47" line counts down. */
  readonly secondsRemaining: number;
  /** True once the wait is over — the flag the resend action is gated on. */
  readonly canResend: boolean;
  /** Re-arms the full minute. Called when a code is sent again. */
  readonly restart: () => void;
}

/**
 * The sixty seconds between one code and the next.
 *
 * A chain of one-second timeouts rather than an interval: the effect re-runs on each tick, so
 * there is exactly one timer alive at a time, `restart` cancels the pending one by changing
 * the state the effect depends on, and the timer stops itself at zero instead of firing every
 * second for as long as the screen is open.
 */
export const useResendCountdown = (): ResendCountdown => {
  const [secondsRemaining, setSecondsRemaining] = useState(RESEND_COUNTDOWN_SECONDS);

  useEffect(() => {
    if (secondsRemaining <= COUNTDOWN_FINISHED) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setSecondsRemaining(remaining => remaining - 1);
    }, ONE_SECOND_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [secondsRemaining]);

  const restart = (): void => {
    setSecondsRemaining(RESEND_COUNTDOWN_SECONDS);
  };

  return {
    secondsRemaining,
    canResend: secondsRemaining <= COUNTDOWN_FINISHED,
    restart,
  };
};
