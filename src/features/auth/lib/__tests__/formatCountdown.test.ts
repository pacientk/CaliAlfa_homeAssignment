import { formatCountdown } from '@features/auth';

/** The canvas draws `0:47` on artboard A3; everything below is that format's edges. */
describe('the resend countdown clock', () => {
  it('prints the full minute the countdown starts from', () => {
    expect(formatCountdown(60)).toBe('1:00');
  });

  it('prints the value the canvas draws', () => {
    expect(formatCountdown(47)).toBe('0:47');
  });

  it('pads the last nine seconds rather than printing 0:7', () => {
    expect(formatCountdown(7)).toBe('0:07');
  });

  it('prints zero as a clock, not as an empty string', () => {
    expect(formatCountdown(0)).toBe('0:00');
  });

  it('never prints a negative clock', () => {
    expect(formatCountdown(-5)).toBe('0:00');
  });
});
