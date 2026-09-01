/**
 * A phone verification in flight.
 *
 * The screen receives one when the code is sent and hands it back when the code is typed.
 * It is opaque on purpose: the provider's own confirmation object never leaves this
 * feature, so no screen has a Firebase type in its props.
 */
export interface ConfirmationHandle {
  /** The provider's id for this verification. Present for diagnostics; nothing branches on it. */
  readonly verificationId: string | undefined;
  /**
   * Submits the code to the provider, unmapped. `AuthService.confirmCode` is the only
   * intended caller — it is where the provider's errors become an `AuthFailure`.
   */
  readonly confirm: (code: string) => Promise<void>;
}

/**
 * The seam between the app and the identity provider.
 *
 * It exists so that the store, the screens, and the tests depend on this interface rather
 * than on `@react-native-firebase/auth` — which is also what makes the store testable
 * without a native module (`docs/architecture/principles.md § D`).
 *
 * Every method rejects with an `AuthError`, never with a provider error.
 */
export interface AuthService {
  /** Asks the provider to send a six-digit code to an E.164 number. */
  sendVerificationCode(e164Phone: string): Promise<ConfirmationHandle>;
  /** Completes the sign-in. Resolving means the session now exists. */
  confirmCode(handle: ConfirmationHandle, code: string): Promise<void>;
  /** Ends the session with the provider. */
  signOut(): Promise<void>;
  /**
   * Reports the signed-in number, and `undefined` when there is none, once on subscribe
   * and on every change afterwards. The returned function unsubscribes.
   */
  observeSession(listener: (phone: string | undefined) => void): () => void;
}
