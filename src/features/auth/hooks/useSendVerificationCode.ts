import { useState } from 'react';

import { toE164 } from '../lib/phoneNumber';
import { isAuthError } from '../model/AuthError';
import type { AuthFailure } from '../model/AuthFailure';
import { useAuthService } from '../model/authServiceContext';
import { setVerification } from '../model/verificationStore';

export interface SendVerificationCode {
  /**
   * Normalises the number, asks the provider for a code, and records the attempt. Resolves
   * `true` when a code is on its way — the caller uses that to move on or to re-arm the
   * countdown, and never has to interpret a failure to find out.
   */
  readonly send: (rawPhoneNumber: string) => Promise<boolean>;
  /** The last failure, or `undefined` while nothing has gone wrong. */
  readonly failure: AuthFailure | undefined;
  readonly isSending: boolean;
}

/**
 * Sending a code, for the phone screen and for the OTP screen's resend.
 *
 * Both callers do exactly this, which is why it is a hook and not two copies: normalise,
 * call, store the handle, keep the failure. What differs between them is what they do
 * afterwards, and that is the boolean this returns.
 */
export const useSendVerificationCode = (): SendVerificationCode => {
  const service = useAuthService();
  const [failure, setFailure] = useState<AuthFailure | undefined>(undefined);
  const [isSending, setIsSending] = useState(false);

  const send = async (rawPhoneNumber: string): Promise<boolean> => {
    setIsSending(true);
    setFailure(undefined);

    const e164Phone = toE164(rawPhoneNumber);

    try {
      setVerification(e164Phone, await service.sendVerificationCode(e164Phone));
      return true;
    } catch (cause) {
      // `AuthService` promises to reject with an `AuthError` and nothing else, but a
      // rejection is `unknown` to the type system; anything that is not one is genuinely
      // unrecognised and keeps its cause rather than being flattened into a known kind.
      setFailure(isAuthError(cause) ? cause.failure : { kind: 'unknown', cause });
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return { send, failure, isSending };
};
