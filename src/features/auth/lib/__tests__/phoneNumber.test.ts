import {
  composeE164,
  isPlausibleNumberParts,
  isPlausiblePhoneNumber,
  sanitiseNationalNumber,
  sanitisePhoneInput,
  toE164,
} from '@features/auth';

/**
 * The gate is plausibility, not validity — see `lib/phoneNumber.ts`. So every case below is
 * about the shape of what was typed, and none of them claims a number exists.
 */
describe('sanitising what the field accepts', () => {
  it('keeps digits, the spaces they are grouped with, and a leading plus', () => {
    expect(sanitisePhoneInput('+34 666 55 44 33')).toBe('+34 666 55 44 33');
  });

  it('drops characters that are not part of a phone number', () => {
    expect(sanitisePhoneInput('+34 (666) 55-44-33 ext')).toBe('+34 666 554433 ');
  });

  it('keeps a plus only in first position', () => {
    expect(sanitisePhoneInput('+34+66+6')).toBe('+34666');
  });

  it('does not invent a plus for a number typed without one', () => {
    expect(sanitisePhoneInput('050 000 0000')).toBe('050 000 0000');
  });

  it('returns nothing for an empty field', () => {
    expect(sanitisePhoneInput('')).toBe('');
  });
});

describe('normalising to E.164', () => {
  it('removes the grouping spaces and keeps one leading plus', () => {
    expect(toE164('+972 50-000-0000')).toBe('+972500000000');
  });

  it('is idempotent on an already normalised number', () => {
    expect(toE164('+972500000000')).toBe('+972500000000');
  });
});

describe('the plausibility gate', () => {
  it('accepts an international number of a possible length', () => {
    expect(isPlausiblePhoneNumber('+972 50-000-0000')).toBe(true);
  });

  it('accepts the shortest and the longest E.164 numbers there can be', () => {
    expect(isPlausiblePhoneNumber('+1234567')).toBe(false);
    expect(isPlausiblePhoneNumber('+12345678')).toBe(true);
    expect(isPlausiblePhoneNumber('+123456789012345')).toBe(true);
    expect(isPlausiblePhoneNumber('+1234567890123456')).toBe(false);
  });

  it('rejects an empty field', () => {
    expect(isPlausiblePhoneNumber('')).toBe(false);
  });

  it('rejects a number with no country code, rather than guessing one', () => {
    expect(isPlausiblePhoneNumber('500000000')).toBe(false);
  });

  it('rejects a prefix on its own', () => {
    expect(isPlausiblePhoneNumber('+')).toBe(false);
  });
});

describe('the national half of the field', () => {
  it('keeps digits and the spaces people group them with', () => {
    expect(sanitiseNationalNumber('50 000 0000')).toBe('50 000 0000');
  });

  it('drops a plus, wherever it is typed', () => {
    // The country segment already carries one; a second composes into +972+34… on the wire.
    expect(sanitiseNationalNumber('+34 666')).toBe('34 666');
    expect(sanitiseNationalNumber('34+666')).toBe('34666');
  });

  it('drops letters and punctuation', () => {
    expect(sanitiseNationalNumber('50-000-0000')).toBe('500000000');
    expect(sanitiseNationalNumber('abc 666')).toBe(' 666');
  });
});

describe('composing the chosen country with the typed number', () => {
  it('joins them into E.164, stripping the grouping spaces', () => {
    expect(composeE164('+972', '50 000 0000')).toBe('+972500000000');
  });

  it('produces the country alone when nothing has been typed', () => {
    expect(composeE164('+34', '')).toBe('+34');
  });

  it('is plausible only once the composed number is long enough', () => {
    expect(isPlausibleNumberParts('+972', '')).toBe(false);
    expect(isPlausibleNumberParts('+972', '5282')).toBe(false);
    expect(isPlausibleNumberParts('+972', '50 000 0000')).toBe(true);
  });

  it('is implausible when the composed number is too long for E.164', () => {
    expect(isPlausibleNumberParts('+972', '1234567890123')).toBe(false);
  });
});
