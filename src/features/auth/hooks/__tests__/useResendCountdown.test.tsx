import { useResendCountdown } from '@features/auth';
import { act, renderHook } from '@testing-library/react-native';

/**
 * The clock is the unit here, so it is the one thing that is faked. Everything else — the
 * effect chain, the state, the re-arm — is the real hook.
 */
const COUNTDOWN_SECONDS = 60;
const ONE_SECOND_MS = 1_000;

/**
 * One second at a time, deliberately. The hook keeps a single timeout alive and schedules the
 * next one from the render that follows each tick, so jumping the clock by a minute in one
 * call would fire exactly one of them — which is a property of the design, not a bug, and the
 * reason this helper loops instead of multiplying.
 */
const advanceSeconds = async (seconds: number): Promise<void> => {
  for (let tick = 0; tick < seconds; tick += 1) {
    await act(async () => {
      jest.advanceTimersByTime(ONE_SECOND_MS);
      await Promise.resolve();
    });
  }
};

describe('the resend countdown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts at a full minute with resend locked', async () => {
    const { result } = await renderHook(() => useResendCountdown());

    expect(result.current.secondsRemaining).toBe(COUNTDOWN_SECONDS);
    expect(result.current.canResend).toBe(false);
  });

  it('counts down one second at a time', async () => {
    const { result } = await renderHook(() => useResendCountdown());

    await advanceSeconds(13);

    expect(result.current.secondsRemaining).toBe(COUNTDOWN_SECONDS - 13);
  });

  it('keeps resend locked one second before the wait is over', async () => {
    const { result } = await renderHook(() => useResendCountdown());

    await advanceSeconds(COUNTDOWN_SECONDS - 1);

    expect(result.current.secondsRemaining).toBe(1);
    expect(result.current.canResend).toBe(false);
  });

  it('releases resend when it reaches zero', async () => {
    const { result } = await renderHook(() => useResendCountdown());

    await advanceSeconds(COUNTDOWN_SECONDS);

    expect(result.current.secondsRemaining).toBe(0);
    expect(result.current.canResend).toBe(true);
  });

  it('stops at zero rather than counting into negative seconds', async () => {
    const { result } = await renderHook(() => useResendCountdown());

    await advanceSeconds(COUNTDOWN_SECONDS * 2);

    expect(result.current.secondsRemaining).toBe(0);
  });

  it('re-arms the full minute and locks resend again when restarted', async () => {
    const { result } = await renderHook(() => useResendCountdown());
    await advanceSeconds(COUNTDOWN_SECONDS);

    await act(() => {
      result.current.restart();
    });

    expect(result.current.secondsRemaining).toBe(COUNTDOWN_SECONDS);
    expect(result.current.canResend).toBe(false);
  });
});
