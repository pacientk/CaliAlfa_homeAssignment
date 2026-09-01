import { isTaskExpired } from '../isTaskExpired';

const NOW = '2026-09-01T12:00:00.000Z';
const EARLIER = '2026-09-01T11:59:59.999Z';
const LATER = '2026-09-01T12:00:00.001Z';

describe('isTaskExpired', () => {
  it('reports a task whose expiry is in the past as expired', () => {
    expect(isTaskExpired({ expiresAt: EARLIER }, NOW)).toBe(true);
  });

  it('does not report a task whose expiry is still ahead', () => {
    expect(isTaskExpired({ expiresAt: LATER }, NOW)).toBe(false);
  });

  it('does not report a task with no expiry at all — absent means never expires', () => {
    expect(isTaskExpired({}, NOW)).toBe(false);
    expect(isTaskExpired({ expiresAt: undefined }, NOW)).toBe(false);
  });

  it('treats an expiry exactly at the instant as not yet passed', () => {
    // The boundary is stated rather than left to chance: `<` and not `<=`, so a task is
    // usable up to and including its own deadline.
    expect(isTaskExpired({ expiresAt: NOW }, NOW)).toBe(false);
  });

  it('answers differently for the same task as the instant moves past its expiry', () => {
    const task = { expiresAt: NOW };

    expect(isTaskExpired(task, EARLIER)).toBe(false);
    expect(isTaskExpired(task, LATER)).toBe(true);
  });
});
