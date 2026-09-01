import type { AuthFailure } from '@features/auth';
import { toAuthFailure } from '@features/auth';

/**
 * The mapper is the only place a provider error code becomes something the app can act
 * on, so this file is the specification of that table. Covers AC-4 in both directions:
 * every code the phone flow can raise, and an unrecognised one that must survive as
 * `unknown` rather than being flattened into a message that would be a lie.
 */

/** Every code the send-and-confirm flow can raise, with the kind it must produce. */
const KNOWN_CODES: readonly (readonly [string, AuthFailure['kind']])[] = [
  ['auth/invalid-verification-code', 'invalidCode'],
  ['auth/missing-verification-code', 'invalidCode'],
  ['auth/invalid-verification-id', 'invalidCode'],
  ['auth/session-expired', 'expiredCode'],
  ['auth/code-expired', 'expiredCode'],
  ['auth/quota-exceeded', 'quotaExceeded'],
  ['auth/too-many-requests', 'quotaExceeded'],
  ['auth/invalid-phone-number', 'invalidPhone'],
  ['auth/missing-phone-number', 'invalidPhone'],
  ['auth/network-request-failed', 'network'],
];

/** A rejection shaped the way the Firebase SDK shapes one. */
const firebaseErrorWithCode = (code: string): Error & { code: string } =>
  Object.assign(new Error(`Firebase said ${code}`), { code });

describe('mapping a Firebase rejection onto an AuthFailure', () => {
  for (const [code, expectedKind] of KNOWN_CODES) {
    it(`turns ${code} into ${expectedKind}`, () => {
      expect(toAuthFailure(firebaseErrorWithCode(code))).toEqual({ kind: expectedKind });
    });
  }

  it('keeps a code it does not recognise as unknown, with the original error attached', () => {
    const cause = firebaseErrorWithCode('auth/user-disabled');

    const failure = toAuthFailure(cause);

    expect(failure).toEqual({ kind: 'unknown', cause });
    expect(failure.kind === 'unknown' && failure.cause).toBe(cause);
  });

  it('never reports a recognised kind for a code outside the table', () => {
    const mappedKinds = KNOWN_CODES.map(([, kind]) => kind);

    expect(mappedKinds).not.toContain(toAuthFailure(firebaseErrorWithCode('auth/whatever')).kind);
  });

  it('treats a plain error with no code as unknown rather than as a network failure', () => {
    const cause = new Error('the bridge went away');

    expect(toAuthFailure(cause)).toEqual({ kind: 'unknown', cause });
  });

  it('survives a rejection that is not an object at all', () => {
    expect(toAuthFailure('auth/network-request-failed')).toEqual({
      kind: 'unknown',
      cause: 'auth/network-request-failed',
    });
    expect(toAuthFailure(undefined)).toEqual({ kind: 'unknown', cause: undefined });
    expect(toAuthFailure(null)).toEqual({ kind: 'unknown', cause: null });
  });

  it('ignores a code that is present but not a string', () => {
    const numericCode = { code: 42 };

    expect(toAuthFailure(numericCode)).toEqual({ kind: 'unknown', cause: numericCode });
  });

  it('reads the code as a type check rather than coercing whatever is there into one', () => {
    // Without the `typeof` guard this stringifies to a code in the table and would be
    // reported as a network failure, which is the wrong message about the wrong problem.
    const stringifiableCode = { code: { toString: (): string => 'auth/network-request-failed' } };

    expect(toAuthFailure(stringifiableCode)).toEqual({
      kind: 'unknown',
      cause: stringifiableCode,
    });
  });
});
