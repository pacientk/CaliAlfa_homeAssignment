import { strings } from '@lib/strings';

/**
 * The expiry picker's choices.
 *
 * The task block asks for date **and** time granularity, and the app has no native date
 * picker: adding one is a native dependency, a `pod install` and a full rebuild against
 * React Native 0.80, which `verification-checklist.md §13` warns is where most current
 * packages fail codegen. A bounded set of relative days crossed with four times of day
 * gives the same two-part value — a day and an hour — with no native surface at all, and
 * the field's contract (an ISO moment, or nothing) is unchanged, so swapping a wheel in
 * later touches this file and the picker component only.
 */

export interface ExpiryDayChoice {
  readonly key: string;
  readonly label: string;
  /** Days from today. `0` is today, which is what makes "expires some time today" reachable. */
  readonly dayOffset: number;
}

export interface ExpiryTimeChoice {
  readonly key: string;
  readonly label: string;
  readonly hour: number;
  readonly minute: number;
}

const DAY_TOMORROW = 1;
const DAY_IN_THREE = 3;
const DAY_IN_A_WEEK = 7;

const MORNING_HOUR = 9;
const MIDDAY_HOUR = 12;
const EVENING_HOUR = 18;
const END_OF_DAY_HOUR = 23;
const END_OF_DAY_MINUTE = 59;
const ON_THE_HOUR = 0;

const CLOCK_DIGITS = 2;

/** `09:00`. A time of day is a number, so it is formatted rather than kept in the copy file. */
const clockLabel = (hour: number, minute: number): string =>
  `${String(hour).padStart(CLOCK_DIGITS, '0')}:${String(minute).padStart(CLOCK_DIGITS, '0')}`;

const timeChoice = (hour: number, minute: number): ExpiryTimeChoice => ({
  key: clockLabel(hour, minute),
  label: clockLabel(hour, minute),
  hour,
  minute,
});

export const EXPIRY_DAY_CHOICES: readonly ExpiryDayChoice[] = [
  { key: 'today', label: strings.taskForm.expiry.picker.today, dayOffset: 0 },
  { key: 'tomorrow', label: strings.taskForm.expiry.picker.tomorrow, dayOffset: DAY_TOMORROW },
  {
    key: 'inThreeDays',
    label: strings.taskForm.expiry.picker.inThreeDays,
    dayOffset: DAY_IN_THREE,
  },
  { key: 'inAWeek', label: strings.taskForm.expiry.picker.inAWeek, dayOffset: DAY_IN_A_WEEK },
];

export const EXPIRY_TIME_CHOICES: readonly ExpiryTimeChoice[] = [
  timeChoice(MORNING_HOUR, ON_THE_HOUR),
  timeChoice(MIDDAY_HOUR, ON_THE_HOUR),
  timeChoice(EVENING_HOUR, ON_THE_HOUR),
  timeChoice(END_OF_DAY_HOUR, END_OF_DAY_MINUTE),
];

/** The choice the picker opens on when the task has no expiry yet. */
export const DEFAULT_EXPIRY_TIME_KEY = clockLabel(EVENING_HOUR, ON_THE_HOUR);

/**
 * Turns a day offset and a time of day into the ISO moment that gets stored.
 *
 * `from` is passed in rather than read from the clock so the composition is pure and a test
 * can state exactly which "today" it means. The day is advanced through `setDate`, which
 * carries month and year ends and daylight-saving shifts for free — arithmetic on
 * milliseconds does neither.
 */
export const composeExpiry = (
  from: Date,
  dayOffset: number,
  hour: number,
  minute: number,
): string => {
  const moment = new Date(from.getTime());

  moment.setDate(moment.getDate() + dayOffset);
  moment.setHours(hour, minute, 0, 0);

  return moment.toISOString();
};

/** Which chip in each row is lit while the picker is open. */
export interface ExpirySelection {
  readonly dayKey: string;
  readonly timeKey: string;
}

const DEFAULT_EXPIRY_DAY_KEY = 'today';

/**
 * The selection a picker opens on.
 *
 * A stored expiry that one of the offered combinations reproduces exactly lights that
 * combination; anything else — a moment set on another device, or a task edited months after
 * it was written — opens on the default rather than lighting a chip that would silently
 * change the value. The stored moment is untouched either way: only pressing Done writes.
 */
export const matchExpirySelection = (value: string | null, now: Date): ExpirySelection => {
  const fallback: ExpirySelection = {
    dayKey: DEFAULT_EXPIRY_DAY_KEY,
    timeKey: DEFAULT_EXPIRY_TIME_KEY,
  };

  if (value === null) {
    return fallback;
  }

  for (const day of EXPIRY_DAY_CHOICES) {
    for (const time of EXPIRY_TIME_CHOICES) {
      if (composeExpiry(now, day.dayOffset, time.hour, time.minute) === value) {
        return { dayKey: day.key, timeKey: time.key };
      }
    }
  }

  return fallback;
};
