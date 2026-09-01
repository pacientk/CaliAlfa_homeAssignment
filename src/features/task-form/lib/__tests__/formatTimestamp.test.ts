import { formatTimestamp } from '../formatTimestamp';

/**
 * Every expectation is built from a locally-constructed `Date`, so the suite states the same
 * wall-clock moment the formatter reads and passes in any time zone the machine is set to.
 */
const MARCH = 2;
const NOVEMBER = 10;

describe('formatTimestamp (artboard B8)', () => {
  it('renders the day, the short month, the year and a 24-hour clock', () => {
    const moment = new Date(2026, MARCH, 18, 18, 0);

    expect(formatTimestamp(moment.toISOString())).toBe('18 Mar 2026, 18:00');
  });

  it('pads the clock but never the day, exactly as the artboard draws it', () => {
    const moment = new Date(2026, MARCH, 3, 9, 5);

    expect(formatTimestamp(moment.toISOString())).toBe('3 Mar 2026, 09:05');
  });

  it('reads the month from the local calendar rather than from the string', () => {
    const moment = new Date(2026, NOVEMBER, 1, 23, 59);

    expect(formatTimestamp(moment.toISOString())).toBe('1 Nov 2026, 23:59');
  });

  it('renders nothing for a value that is not a date, rather than "Invalid Date"', () => {
    expect(formatTimestamp('not-a-date')).toBe('');
    expect(formatTimestamp('')).toBe('');
  });
});
