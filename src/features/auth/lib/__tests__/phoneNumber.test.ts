import { isPlausiblePhoneNumber, sanitisePhoneInput, toE164 } from '@features/auth';

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
    expect(sanitisePhoneInput('052 828 7009')).toBe('052 828 7009');
  });

  it('returns nothing for an empty field', () => {
    expect(sanitisePhoneInput('')).toBe('');
  });
});

describe('normalising to E.164', () => {
  it('removes the grouping spaces and keeps one leading plus', () => {
    expect(toE164('+972 52-828-7009')).toBe('+972528287009');
  });

  it('is idempotent on an already normalised number', () => {
    expect(toE164('+972528287009')).toBe('+972528287009');
  });
});

describe('the plausibility gate', () => {
  it('accepts an international number of a possible length', () => {
    expect(isPlausiblePhoneNumber('+972 52-828-7009')).toBe(true);
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
    expect(isPlausiblePhoneNumber('528287009')).toBe(false);
  });

  it('rejects a prefix on its own', () => {
    expect(isPlausiblePhoneNumber('+')).toBe(false);
  });
});
