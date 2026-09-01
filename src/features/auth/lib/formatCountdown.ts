/**
 * Seconds as the canvas draws them on artboard A3: `0:47`.
 *
 * Minutes are not padded and seconds always are, which is how a clock reads everywhere — and
 * the reason this is a helper rather than a template literal at the call site is that
 * `${seconds}` alone renders `0:7` for the last ten seconds of the wait.
 */
const SECONDS_PER_MINUTE = 60;
const SECONDS_PAD_LENGTH = 2;

export const formatCountdown = (totalSeconds: number): string => {
  const safeSeconds = Math.max(0, Math.trunc(totalSeconds));
  const minutes = Math.floor(safeSeconds / SECONDS_PER_MINUTE);
  const seconds = safeSeconds % SECONDS_PER_MINUTE;

  return `${minutes}:${String(seconds).padStart(SECONDS_PAD_LENGTH, '0')}`;
};
