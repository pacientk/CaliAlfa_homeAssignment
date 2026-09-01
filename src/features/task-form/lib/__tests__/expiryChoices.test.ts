import {
  composeExpiry,
  DEFAULT_EXPIRY_TIME_KEY,
  EXPIRY_DAY_CHOICES,
  EXPIRY_TIME_CHOICES,
  matchExpirySelection,
} from '../expiryChoices';

const MARCH = 2;
const DECEMBER = 11;
const EVENING_HOUR = 18;
const MORNING_HOUR = 9;
const A_WEEK = 7;

const NOON_ON_THE_18TH = new Date(2026, MARCH, 18, 12, 30);

describe('composeExpiry', () => {
  it('keeps the chosen day and replaces the time of day', () => {
    const composed = new Date(composeExpiry(NOON_ON_THE_18TH, 0, EVENING_HOUR, 0));

    expect(composed.getFullYear()).toBe(2026);
    expect(composed.getMonth()).toBe(MARCH);
    expect(composed.getDate()).toBe(18);
    expect(composed.getHours()).toBe(EVENING_HOUR);
    expect(composed.getMinutes()).toBe(0);
    expect(composed.getSeconds()).toBe(0);
  });

  it('advances by whole days through the calendar, so a week later is the 25th', () => {
    const composed = new Date(composeExpiry(NOON_ON_THE_18TH, A_WEEK, MORNING_HOUR, 0));

    expect(composed.getDate()).toBe(25);
    expect(composed.getMonth()).toBe(MARCH);
  });

  it('carries the year end rather than overflowing the month', () => {
    const newYearsEve = new Date(2026, DECEMBER, 31, 12, 0);
    const composed = new Date(composeExpiry(newYearsEve, 1, MORNING_HOUR, 0));

    expect(composed.getFullYear()).toBe(2027);
    expect(composed.getMonth()).toBe(0);
    expect(composed.getDate()).toBe(1);
  });

  it('stores UTC, so what is compared later is one fixed-width chronological string', () => {
    expect(composeExpiry(NOON_ON_THE_18TH, 0, EVENING_HOUR, 0)).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
  });
});

describe('matchExpirySelection', () => {
  it('lights the combination that reproduces the stored moment', () => {
    const stored = composeExpiry(NOON_ON_THE_18TH, A_WEEK, MORNING_HOUR, 0);

    expect(matchExpirySelection(stored, NOON_ON_THE_18TH)).toEqual({
      dayKey: 'inAWeek',
      timeKey: '09:00',
    });
  });

  it('falls back to today at the default time when the task has no expiry', () => {
    expect(matchExpirySelection(null, NOON_ON_THE_18TH)).toEqual({
      dayKey: 'today',
      timeKey: DEFAULT_EXPIRY_TIME_KEY,
    });
  });

  it('falls back rather than lighting a chip that would change a moment it cannot express', () => {
    const anOddMoment = new Date(2026, MARCH, 18, 7, 13).toISOString();

    expect(matchExpirySelection(anOddMoment, NOON_ON_THE_18TH)).toEqual({
      dayKey: 'today',
      timeKey: DEFAULT_EXPIRY_TIME_KEY,
    });
  });
});

describe('the offered choices', () => {
  it('offers a same-day expiry, which is the case the disabled row exists for', () => {
    expect(EXPIRY_DAY_CHOICES.map(choice => choice.dayOffset)).toContain(0);
  });

  it('names every time of day by its own clock reading, so no copy can drift from it', () => {
    for (const choice of EXPIRY_TIME_CHOICES) {
      expect(choice.key).toBe(choice.label);
      expect(choice.label).toMatch(/^\d{2}:\d{2}$/);
    }
  });

  it('keys every choice uniquely, so a chip cannot select two things', () => {
    const dayKeys = EXPIRY_DAY_CHOICES.map(choice => choice.key);
    const timeKeys = EXPIRY_TIME_CHOICES.map(choice => choice.key);

    expect(new Set(dayKeys).size).toBe(dayKeys.length);
    expect(new Set(timeKeys).size).toBe(timeKeys.length);
  });
});
