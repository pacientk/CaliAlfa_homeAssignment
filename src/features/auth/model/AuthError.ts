import type { AuthFailure } from './AuthFailure';

/**
 * The only error the auth feature throws. It mirrors `shared/api/ApiError` on purpose:
 * the codebase already has one shape for "a classified failure crossed a service
 * boundary", and a second shape would mean every caller learns two.
 *
 * No component ever sees a raw Firebase error, because nothing but `firebaseAuthService`
 * is allowed to construct this and it constructs it from `toAuthFailure` alone.
 */
export class AuthError extends Error {
  readonly failure: AuthFailure;

  constructor(failure: AuthFailure) {
    super(`Authentication failed: ${failure.kind}`);
    this.name = 'AuthError';
    this.failure = failure;
  }
}

/** Narrows an unknown thrown value to an `AuthError`. */
export const isAuthError = (error: unknown): error is AuthError => error instanceof AuthError;
