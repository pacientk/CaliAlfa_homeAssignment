/**
 * The authentication feature's public surface.
 *
 * The provider lives behind `AuthService`: screens send a code, confirm a code, and read
 * the session, and none of them imports `@react-native-firebase/auth` or ever sees a raw
 * Firebase error. `AuthError.failure` is the only failure shape that crosses this line.
 *
 * It lives here rather than in `shared/store/` because the session is not cross-cutting
 * infrastructure — it is this feature's state, and `shared/` may not import from a feature.
 */
export { AuthError, isAuthError } from './model/AuthError';
export type { AuthFailure } from './model/AuthFailure';
export { toAuthFailure } from './model/AuthFailure';
export type { AuthService, ConfirmationHandle } from './model/AuthService';
export { firebaseAuthService } from './model/firebaseAuthService';
export {
  signIn,
  signOut,
  startSessionObserver,
  useIsSessionInitialising,
  useIsSignedIn,
  useSessionPhoneNumber,
} from './model/sessionStore';
