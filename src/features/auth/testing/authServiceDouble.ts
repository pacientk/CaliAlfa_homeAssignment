import type { AuthService, ConfirmationHandle } from '../model/AuthService';

/**
 * The double the session store is exercised against. It lives beside the interface it
 * implements, for the reason the task-sync doubles give: a double in the same tree as its
 * interface is the one that gets updated when the interface changes.
 */
export interface FakeAuthService extends AuthService {
  /** Reports a session state to every live listener, as the provider's listener would. */
  emitSession(phone: string | undefined): void;
  /** How many listeners are still subscribed. */
  readonly listenerCount: () => number;
  /** Every number `sendVerificationCode` was asked for, in order. */
  readonly requestedPhones: string[];
  /** Every code `confirmCode` was asked to submit, in order. */
  readonly submittedCodes: string[];
  readonly signOutCount: () => number;
}

/** The handle `sendVerificationCode` hands back. Nothing in the store reads inside it. */
const HANDLE_DOUBLE: ConfirmationHandle = {
  verificationId: 'verification-id-double',
  confirm: (): Promise<void> => Promise.resolve(),
};

export const createFakeAuthService = (): FakeAuthService => {
  const listeners = new Set<(phone: string | undefined) => void>();
  const requestedPhones: string[] = [];
  const submittedCodes: string[] = [];
  let signOuts = 0;

  return {
    requestedPhones,
    submittedCodes,
    listenerCount: (): number => listeners.size,
    signOutCount: (): number => signOuts,

    sendVerificationCode: (e164Phone: string): Promise<ConfirmationHandle> => {
      requestedPhones.push(e164Phone);
      return Promise.resolve(HANDLE_DOUBLE);
    },

    confirmCode: (_handle: ConfirmationHandle, code: string): Promise<void> => {
      submittedCodes.push(code);
      return Promise.resolve();
    },

    signOut: (): Promise<void> => {
      signOuts += 1;
      return Promise.resolve();
    },

    observeSession: (listener: (phone: string | undefined) => void): (() => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    emitSession: (phone: string | undefined): void => {
      for (const listener of listeners) {
        listener(phone);
      }
    },
  };
};
