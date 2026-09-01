import { create } from 'zustand';

import type { ConfirmationHandle } from './AuthService';

/**
 * The verification in flight, between the screen that starts it and the screen that finishes
 * it. Two fields, both absent until a code has actually been sent.
 */
interface VerificationState {
  /** The E.164 number the code went to. The OTP screen prints it back, so it is not decorative. */
  readonly phoneNumber?: string;
  /** The provider's handle for this attempt. Resending replaces it; confirming consumes it. */
  readonly handle?: ConfirmationHandle;
}

/**
 * It is a store rather than navigation state for one reason: a `ConfirmationHandle` holds a
 * function, and React Navigation params are serialisable state that ends up in a persisted
 * navigation tree. It is a store rather than a `useState` inside `AuthStack` for another: the
 * stack's route components are module-level, as `docs/architecture/principles.md
 * § Component Decomposition` requires, so they cannot close over the navigator's own state.
 */
const NO_VERIFICATION: VerificationState = {};

const useVerificationStore = create<VerificationState>()(() => NO_VERIFICATION);

/**
 * Records a code that has just been sent. Replaces rather than merges — a resend must not be
 * able to leave the previous attempt's handle in place beside the new number.
 */
export const setVerification = (phoneNumber: string, handle: ConfirmationHandle): void => {
  useVerificationStore.setState({ phoneNumber, handle }, true);
};

/** Forgets the attempt. Called once the session exists, so a later visit starts clean. */
export const clearVerification = (): void => {
  useVerificationStore.setState(NO_VERIFICATION, true);
};

/** The number the code went to, for the "Sent to …" line. */
export const useVerificationPhoneNumber = (): string | undefined =>
  useVerificationStore(state => state.phoneNumber);

/** The handle the code is confirmed against. Absent means there is nothing to confirm. */
export const useVerificationHandle = (): ConfirmationHandle | undefined =>
  useVerificationStore(state => state.handle);
