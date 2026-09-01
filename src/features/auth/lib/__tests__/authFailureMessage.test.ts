import type { AuthFailure } from '@features/auth';
import { authFailureMessage } from '@features/auth';

/**
 * FR-4 asks for a distinct message per failure kind. "Distinct" is the assertion that matters:
 * a table that silently mapped two kinds onto one sentence would pass a "has a message" test.
 */
const EVERY_FAILURE: readonly AuthFailure[] = [
  { kind: 'invalidCode' },
  { kind: 'expiredCode' },
  { kind: 'quotaExceeded' },
  { kind: 'invalidPhone' },
  { kind: 'network' },
  { kind: 'unknown', cause: new Error('something the mapper did not recognise') },
];

describe('the message for a failure', () => {
  it('has one for every kind the union can hold', () => {
    for (const failure of EVERY_FAILURE) {
      expect(authFailureMessage(failure).length).toBeGreaterThan(0);
    }
  });

  it('says something different for each kind', () => {
    const messages = EVERY_FAILURE.map(authFailureMessage);

    expect(new Set(messages).size).toBe(EVERY_FAILURE.length);
  });

  it('does not leak the underlying cause into what the user reads', () => {
    const message = authFailureMessage({ kind: 'unknown', cause: new Error('auth/internal-x') });

    expect(message).not.toContain('auth/');
  });
});
