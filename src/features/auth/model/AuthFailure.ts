/**
 * Every way phone authentication can fail, classified by what the user should be told
 * about it. The union is deliberately small: the OTP screen has one message per kind,
 * and a kind that no message distinguishes would be a kind that earns nothing.
 *
 * It carries kinds, not copy. The wording lives in `shared/lib/strings.ts` and is chosen
 * by the screen, so this module stays free of user-facing text.
 */
export type AuthFailure =
  /** The six digits do not match the code that was sent. */
  | { kind: 'invalidCode' }
  /** The code was right once, but the verification session has since timed out. */
  | { kind: 'expiredCode' }
  /** The project's SMS allowance is spent, or the device asked too often. */
  | { kind: 'quotaExceeded' }
  /** The number is not a phone number the provider will accept. */
  | { kind: 'invalidPhone' }
  /** The request never reached the provider. Sign-in is the one flow that cannot work
   *  offline (epic §7.3 G), so this kind exists to say exactly that. */
  | { kind: 'network' }
  /** Anything the mapping below does not recognise. The cause is kept rather than
   *  dropped: an unmapped provider code must stay diagnosable. */
  | { kind: 'unknown'; cause: unknown };

/** The kinds that carry no payload — every kind the code table can produce. */
type MappedFailureKind = Exclude<AuthFailure, { kind: 'unknown' }>['kind'];

/**
 * The single place a Firebase error code becomes an `AuthFailure`.
 *
 * Two codes reach several of these kinds because the provider raises a different one
 * depending on whether the field was absent or present-and-wrong, and the user cannot
 * act on that distinction. `auth/session-expired` is what iOS raises when an SMS code
 * outlives its window; `auth/code-expired` is the Android spelling, and both are kept
 * so the table does not have to be revisited if the project ever ships Android.
 */
const FAILURE_KIND_BY_FIREBASE_CODE: ReadonlyMap<string, MappedFailureKind> = new Map([
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
] satisfies readonly (readonly [string, MappedFailureKind])[]);

/**
 * Reads the provider's error code off an unknown thrown value.
 *
 * Firebase rejects with a `NativeFirebaseError`, but a rejection is `unknown` as far as
 * the type system is concerned and a transport-level failure can throw something else
 * entirely, so the shape is checked rather than assumed.
 */
const readFirebaseErrorCode = (cause: unknown): string | undefined => {
  if (typeof cause !== 'object' || cause === null || !('code' in cause)) {
    return undefined;
  }
  const { code } = cause;
  return typeof code === 'string' ? code : undefined;
};

/**
 * Maps a rejection from the Firebase auth SDK onto an `AuthFailure`.
 *
 * An unrecognised code produces `unknown` carrying the original cause rather than being
 * flattened into one of the known kinds: a wrong message about a real problem is worse
 * than an honest "something went wrong", and the cause is the only thread back to it.
 */
export const toAuthFailure = (cause: unknown): AuthFailure => {
  const code = readFirebaseErrorCode(cause);
  const kind = code === undefined ? undefined : FAILURE_KIND_BY_FIREBASE_CODE.get(code);
  return kind === undefined ? { kind: 'unknown', cause } : { kind };
};
