import { COUNTRY_PREFIXES, DEFAULT_COUNTRY_PREFIX } from '@features/auth';

/**
 * The list is data, so the tests are about its shape rather than its taste. What matters is
 * that every entry can be composed into E.164 without further processing, that the keys are
 * usable as keys, and that the two entries the product actually depends on are present.
 */
describe('the country prefix list', () => {
  it('offers a short, hand-picked set rather than the full table', () => {
    expect(COUNTRY_PREFIXES.length).toBeGreaterThanOrEqual(10);
    expect(COUNTRY_PREFIXES.length).toBeLessThanOrEqual(15);
  });

  it('spells every dial code the way E.164 does', () => {
    for (const prefix of COUNTRY_PREFIXES) {
      expect(prefix.dialCode).toMatch(/^\+\d{1,3}$/);
    }
  });

  it('keys every entry uniquely, because dial codes are not unique across countries', () => {
    const isoCodes = COUNTRY_PREFIXES.map(prefix => prefix.iso);

    expect(new Set(isoCodes).size).toBe(COUNTRY_PREFIXES.length);
  });

  it('names every country', () => {
    for (const prefix of COUNTRY_PREFIXES) {
      expect(prefix.country.trim().length).toBeGreaterThan(0);
    }
  });

  it('carries the country the Firebase test number belongs to, as the default', () => {
    expect(DEFAULT_COUNTRY_PREFIX.dialCode).toBe('+972');
    expect(COUNTRY_PREFIXES).toContainEqual(DEFAULT_COUNTRY_PREFIX);
  });

  it('carries the country the design draws', () => {
    expect(COUNTRY_PREFIXES.map(prefix => prefix.dialCode)).toContain('+34');
  });
});
