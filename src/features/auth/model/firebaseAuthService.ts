import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import {
  getAuth,
  onAuthStateChanged,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
} from '@react-native-firebase/auth';

import { AuthError } from './AuthError';
import { toAuthFailure } from './AuthFailure';
import type { AuthService, ConfirmationHandle } from './AuthService';

/**
 * Runs an operation against the provider and republishes any rejection as an `AuthError`.
 *
 * Every provider call in this file goes through it, which is what makes "Firebase error
 * codes map onto `AuthFailure` in exactly one place" true by construction rather than by
 * convention — there is no second `catch` in the feature that could grow its own table.
 */
const mapFailures = async <T>(operation: () => Promise<T>): Promise<T> => {
  try {
    return await operation();
  } catch (cause) {
    throw new AuthError(toAuthFailure(cause));
  }
};

/**
 * Wraps the provider's confirmation object so it never leaves the feature.
 *
 * `verificationId` is narrowed from `string | null` to `string | undefined` because the
 * rest of the codebase spells absence `undefined` and a type that carries both is a type
 * every consumer has to check twice.
 */
const toConfirmationHandle = (
  confirmation: FirebaseAuthTypes.ConfirmationResult,
): ConfirmationHandle => ({
  verificationId: confirmation.verificationId ?? undefined,
  confirm: async (code: string): Promise<void> => {
    await confirmation.confirm(code);
  },
});

/**
 * The Firebase implementation of {@link AuthService}.
 *
 * `getAuth()` is called per operation rather than captured at module scope: the native
 * side is configured in `AppDelegate.application(_:didFinishLaunchingWithOptions:)`, and
 * resolving the instance lazily keeps this module importable before that has run — which
 * is what a Jest process, where the native module does not exist at all, relies on.
 */
export const firebaseAuthService: AuthService = {
  sendVerificationCode: (e164Phone: string): Promise<ConfirmationHandle> =>
    mapFailures(async () => {
      const auth = getAuth();

      // The assignment's Firebase project has no APNs auth key, so the iOS SDK cannot do
      // silent-push device verification. It attempts that BEFORE telling the server which
      // number is being signed in, so it cannot yet know the number is a whitelisted test
      // number, and it falls back to a reCAPTCHA challenge in a web view. Disabling app
      // verification skips that step, after which the configured test number signs in
      // directly.
      //
      // Gated on __DEV__ deliberately: this switch disables reCAPTCHA for every number, so
      // it belongs to the debug build the reviewer runs and not to a release. The
      // consequence — only the test number can sign in here — is a property of the
      // environment and is stated in the README.
      if (__DEV__) {
        auth.settings.appVerificationDisabledForTesting = true;
      }

      return toConfirmationHandle(await signInWithPhoneNumber(auth, e164Phone));
    }),

  confirmCode: (handle: ConfirmationHandle, code: string): Promise<void> =>
    mapFailures(() => handle.confirm(code)),

  signOut: (): Promise<void> => mapFailures(() => firebaseSignOut(getAuth())),

  observeSession: (listener: (phone: string | undefined) => void): (() => void) =>
    onAuthStateChanged(getAuth(), (user: FirebaseAuthTypes.User | null) => {
      listener(user?.phoneNumber ?? undefined);
    }),
};
