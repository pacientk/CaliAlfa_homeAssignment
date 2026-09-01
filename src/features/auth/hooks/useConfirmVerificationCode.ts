import { useState } from 'react';

import { isAuthError } from '../model/AuthError';
import type { AuthFailure } from '../model/AuthFailure';
import { useAuthService } from '../model/authServiceContext';
import { clearVerification, useVerificationHandle } from '../model/verificationStore';

export interface ConfirmVerificationCode {
  /** Submits the six digits. Resolves `true` when the session now exists. */
  readonly confirm: (code: string) => Promise<boolean>;
  /** The last failure. Present is what puts the OTP row into its error palette. */
  readonly failure: AuthFailure | undefined;
  readonly isConfirming: boolean;
  /** Drops the error state — called as soon as the user edits the digits. */
  readonly clearFailure: () => void;
}

/**
 * Confirming the code.
 *
 * There is nothing to do on success: `confirmCode` resolving means Firebase now holds a
 * session, its auth listener fires, the session store follows it, and `RootNavigator` swaps
 * the whole auth stack for the tab shell. A screen that navigated itself would be a second
 * source of truth for the same fact.
 */
export const useConfirmVerificationCode = (): ConfirmVerificationCode => {
  const service = useAuthService();
  const handle = useVerificationHandle();
  const [failure, setFailure] = useState<AuthFailure | undefined>(undefined);
  const [isConfirming, setIsConfirming] = useState(false);

  const confirm = async (code: string): Promise<boolean> => {
    if (handle === undefined) {
      // No handle means the attempt this screen belongs to is gone — the app was restarted
      // on this screen, or the store was cleared. `expiredCode` is the honest kind: the
      // verification session no longer exists, and resending is the way out of it.
      setFailure({ kind: 'expiredCode' });
      return false;
    }

    setIsConfirming(true);
    setFailure(undefined);

    try {
      await service.confirmCode(handle, code);
      clearVerification();
      return true;
    } catch (cause) {
      setFailure(isAuthError(cause) ? cause.failure : { kind: 'unknown', cause });
      return false;
    } finally {
      setIsConfirming(false);
    }
  };

  const clearFailure = (): void => {
    setFailure(undefined);
  };

  return { confirm, failure, isConfirming, clearFailure };
};
