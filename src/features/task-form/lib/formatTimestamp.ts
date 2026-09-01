/**
 * `18 Mar 2026, 18:00` — the format artboard B8 draws, in the device's own time zone.
 *
 * Hand-formatted rather than delegated to `Intl.DateTimeFormat`, for two reasons. Hermes
 * ships a reduced ICU and the exact pattern a locale resolves to is not something this
 * screen may guess at; and the app is English-only by profile (`PROJECT-PROFILE.md §
 * Product constraints`), so there is no locale to respect in the first place. The result is
 * one deterministic string on every device.
 *
 * The *rendering* is local time while the *storage* is UTC ISO — that split is deliberate:
 * "18:00" has to mean six in the evening where the user is standing.
 */
const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

const CLOCK_DIGITS = 2;

const padded = (value: number): string => String(value).padStart(CLOCK_DIGITS, '0');

/** An unparseable stored value renders as nothing rather than as `Invalid Date`. */
export const formatTimestamp = (iso: string): string => {
  const moment = new Date(iso);

  if (Number.isNaN(moment.getTime())) {
    return '';
  }

  const month = MONTH_NAMES[moment.getMonth()] ?? '';
  const day = moment.getDate();
  const year = moment.getFullYear();

  return `${day} ${month} ${year}, ${padded(moment.getHours())}:${padded(moment.getMinutes())}`;
};
