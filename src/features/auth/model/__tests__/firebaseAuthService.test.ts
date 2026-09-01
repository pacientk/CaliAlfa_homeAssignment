import { AuthError, firebaseAuthService, isAuthError } from '@features/auth';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import {
  getAuth,
  onAuthStateChanged,
  signInWithPhoneNumber,
  signOut,
} from '@react-native-firebase/auth';

/**
 * The service is exercised against the global manual mock of the provider SDK, so what is
 * asserted here is the seam itself: what reaches the provider, and what a caller sees when
 * the provider rejects. Whether Firebase itself works is not knowable from a mock — that
 * is verified on the simulator (VR-11, checklist §12).
 */

const mockSignInWithPhoneNumber = jest.mocked(signInWithPhoneNumber);
const mockOnAuthStateChanged = jest.mocked(onAuthStateChanged);
const mockSignOut = jest.mocked(signOut);

const TEST_PHONE = '+972528287009';

/** A rejection shaped the way the Firebase SDK shapes one. */
const firebaseErrorWithCode = (code: string): Error & { code: string } =>
  Object.assign(new Error(`Firebase said ${code}`), { code });

/** The provider's confirmation object, which must never leave the feature. */
const createConfirmationDouble = (
  verificationId: string | null,
  confirm: (code: string) => Promise<FirebaseAuthTypes.UserCredential | null>,
): FirebaseAuthTypes.ConfirmationResult => ({ verificationId, confirm });

const resolvingConfirm = (): Promise<FirebaseAuthTypes.UserCredential | null> =>
  Promise.resolve(null);

/** Runs an operation that must reject, and returns the `AuthError` it rejected with. */
const failureOf = async (operation: () => Promise<unknown>): Promise<AuthError> => {
  try {
    await operation();
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return error;
    }
    throw new Error(`Expected an AuthError, got ${String(error)}`);
  }
  throw new Error('Expected the operation to reject, but it resolved');
};

describe('sending a verification code', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('asks the provider for the number it was given, verbatim', async () => {
    mockSignInWithPhoneNumber.mockResolvedValue(
      createConfirmationDouble('verification-id', resolvingConfirm),
    );

    await firebaseAuthService.sendVerificationCode(TEST_PHONE);

    expect(mockSignInWithPhoneNumber).toHaveBeenCalledTimes(1);
    expect(mockSignInWithPhoneNumber).toHaveBeenCalledWith(getAuth(), TEST_PHONE);
  });

  it('hands back a handle carrying the provider verification id', async () => {
    mockSignInWithPhoneNumber.mockResolvedValue(
      createConfirmationDouble('verification-id', resolvingConfirm),
    );

    const handle = await firebaseAuthService.sendVerificationCode(TEST_PHONE);

    expect(handle.verificationId).toBe('verification-id');
  });

  it('spells a missing verification id undefined rather than null', async () => {
    mockSignInWithPhoneNumber.mockResolvedValue(createConfirmationDouble(null, resolvingConfirm));

    const handle = await firebaseAuthService.sendVerificationCode(TEST_PHONE);

    expect(handle.verificationId).toBeUndefined();
  });

  it('reports a lost connection as a network failure, so the user is told to reconnect', async () => {
    mockSignInWithPhoneNumber.mockRejectedValue(
      firebaseErrorWithCode('auth/network-request-failed'),
    );

    const error = await failureOf(() => firebaseAuthService.sendVerificationCode(TEST_PHONE));

    expect(error.failure).toEqual({ kind: 'network' });
  });

  it('reports a spent SMS allowance as a quota failure', async () => {
    mockSignInWithPhoneNumber.mockRejectedValue(firebaseErrorWithCode('auth/quota-exceeded'));

    const error = await failureOf(() => firebaseAuthService.sendVerificationCode(TEST_PHONE));

    expect(error.failure).toEqual({ kind: 'quotaExceeded' });
  });

  it('reports a malformed number as an invalid-phone failure', async () => {
    mockSignInWithPhoneNumber.mockRejectedValue(firebaseErrorWithCode('auth/invalid-phone-number'));

    const error = await failureOf(() => firebaseAuthService.sendVerificationCode('nonsense'));

    expect(error.failure).toEqual({ kind: 'invalidPhone' });
  });

  it('never lets a raw provider error escape the feature', async () => {
    const cause = firebaseErrorWithCode('auth/app-not-authorized');
    mockSignInWithPhoneNumber.mockRejectedValue(cause);

    const error = await failureOf(() => firebaseAuthService.sendVerificationCode(TEST_PHONE));

    expect(error).toBeInstanceOf(AuthError);
    expect(error.failure).toEqual({ kind: 'unknown', cause });
  });
});

describe('confirming a verification code', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('submits the code to the confirmation the provider handed back', async () => {
    const submitted: string[] = [];
    mockSignInWithPhoneNumber.mockResolvedValue(
      createConfirmationDouble('verification-id', (code: string) => {
        submitted.push(code);
        return resolvingConfirm();
      }),
    );
    const handle = await firebaseAuthService.sendVerificationCode(TEST_PHONE);

    await firebaseAuthService.confirmCode(handle, '123456');

    expect(submitted).toEqual(['123456']);
  });

  it('reports a wrong code as an invalid-code failure', async () => {
    mockSignInWithPhoneNumber.mockResolvedValue(
      createConfirmationDouble('verification-id', () =>
        Promise.reject(firebaseErrorWithCode('auth/invalid-verification-code')),
      ),
    );
    const handle = await firebaseAuthService.sendVerificationCode(TEST_PHONE);

    const error = await failureOf(() => firebaseAuthService.confirmCode(handle, '000000'));

    expect(error.failure).toEqual({ kind: 'invalidCode' });
  });

  it('reports a timed-out verification as an expired-code failure', async () => {
    mockSignInWithPhoneNumber.mockResolvedValue(
      createConfirmationDouble('verification-id', () =>
        Promise.reject(firebaseErrorWithCode('auth/session-expired')),
      ),
    );
    const handle = await firebaseAuthService.sendVerificationCode(TEST_PHONE);

    const error = await failureOf(() => firebaseAuthService.confirmCode(handle, '123456'));

    expect(error.failure).toEqual({ kind: 'expiredCode' });
  });
});

describe('signing out', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('asks the provider to end the session', async () => {
    mockSignOut.mockResolvedValue(undefined);

    await firebaseAuthService.signOut();

    expect(mockSignOut).toHaveBeenCalledWith(getAuth());
  });

  it('maps a rejection rather than letting the provider error through', async () => {
    mockSignOut.mockRejectedValue(firebaseErrorWithCode('auth/network-request-failed'));

    const error = await failureOf(() => firebaseAuthService.signOut());

    expect(error.failure).toEqual({ kind: 'network' });
  });
});

describe('observing the session', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * A provider user carrying only the field the seam reads. The assertion is structurally
   * necessary: `FirebaseAuthTypes.User` is a native-backed interface with several dozen
   * members and methods, and building all of them would assert nothing this test is about.
   */
  const userWithPhone = (phoneNumber: string | null): FirebaseAuthTypes.User =>
    ({ phoneNumber }) as FirebaseAuthTypes.User;

  /** Subscribes and returns the listener the provider was handed. */
  const captureProviderListener = (
    reported: (string | undefined)[],
  ): ((user: FirebaseAuthTypes.User | null) => void) => {
    let captured: FirebaseAuthTypes.AuthListenerCallback | undefined;
    mockOnAuthStateChanged.mockImplementation((_auth: unknown, nextOrObserver) => {
      // The SDK accepts either a callback or an observer object; the service passes a
      // callback, and this narrows to it rather than assuming.
      captured = typeof nextOrObserver === 'function' ? nextOrObserver : nextOrObserver.next;
      return () => {};
    });

    firebaseAuthService.observeSession(phone => reported.push(phone));

    if (captured === undefined) {
      throw new Error('The service did not subscribe to the provider');
    }
    return captured;
  };

  it('reports the signed-in number when the provider reports a user', () => {
    const reported: (string | undefined)[] = [];
    const providerListener = captureProviderListener(reported);

    providerListener(userWithPhone(TEST_PHONE));

    expect(reported).toEqual([TEST_PHONE]);
  });

  it('reports no number when the provider reports no user', () => {
    const reported: (string | undefined)[] = [];
    const providerListener = captureProviderListener(reported);

    providerListener(null);

    expect(reported).toEqual([undefined]);
  });

  it('reports no number for a user that carries none', () => {
    const reported: (string | undefined)[] = [];
    const providerListener = captureProviderListener(reported);

    providerListener(userWithPhone(null));

    expect(reported).toEqual([undefined]);
  });

  it('hands back the provider unsubscribe', () => {
    const providerUnsubscribe = (): void => {};
    mockOnAuthStateChanged.mockReturnValue(providerUnsubscribe);

    expect(firebaseAuthService.observeSession(() => {})).toBe(providerUnsubscribe);
  });
});

/**
 * The auth instance the manual mock hands back. `jest.mocked` restores the mock's own
 * return type, which the real SDK typings do not describe — `settings` is what the service
 * writes and what these tests read back.
 */
const authSettings = (): {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- the Firebase SDK owns this property name; renaming it here would stop describing the thing being written
  appVerificationDisabledForTesting: boolean;
} => jest.mocked(getAuth)().settings;

/**
 * `__DEV__` is a React Native global declared as a bare variable rather than as a member of
 * globalThis, so writing it needs a narrow typed view. The cast is structurally necessary
 * and is the only one in this file.
 */
const devFlag = globalThis as unknown as {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- React Native owns this global's name
  __DEV__: boolean;
};

describe('app verification in a debug build', () => {
  /**
   * The project has no APNs auth key, so the iOS SDK cannot do silent-push device
   * verification and falls back to a reCAPTCHA web challenge. Disabling app verification
   * skips that, which is what lets the whitelisted test number sign in on a simulator.
   *
   * The ordering assertion is the one that matters: the flag has to be set *before* the
   * request goes out, because the SDK reads it at call time. A test that only checked the
   * flag afterwards would pass with the two statements in the wrong order.
   */
  it('disables app verification before it requests a code', async () => {
    const settings = authSettings();
    settings.appVerificationDisabledForTesting = false;

    let wasDisabledWhenRequested: boolean | undefined;
    mockSignInWithPhoneNumber.mockImplementation(() => {
      wasDisabledWhenRequested = settings.appVerificationDisabledForTesting;
      return Promise.resolve(createConfirmationDouble('v-1', resolvingConfirm));
    });

    await firebaseAuthService.sendVerificationCode(TEST_PHONE);

    expect(wasDisabledWhenRequested).toBe(true);
  });

  it('leaves app verification alone outside a debug build', async () => {
    const settings = authSettings();
    settings.appVerificationDisabledForTesting = false;
    mockSignInWithPhoneNumber.mockResolvedValue(createConfirmationDouble('v-1', resolvingConfirm));

    const wasDev = devFlag.__DEV__;
    devFlag.__DEV__ = false;
    try {
      await firebaseAuthService.sendVerificationCode(TEST_PHONE);
    } finally {
      devFlag.__DEV__ = wasDev;
    }

    expect(settings.appVerificationDisabledForTesting).toBe(false);
  });
});
