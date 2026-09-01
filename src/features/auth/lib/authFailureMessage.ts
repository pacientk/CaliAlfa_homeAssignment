import { strings } from '@lib/strings';

import type { AuthFailure } from '../model/AuthFailure';

/**
 * The one place a failure kind becomes something a person reads.
 *
 * A lookup rather than a chain of conditionals, so the compiler is what proves the table is
 * total: `strings.authFailure` is keyed by `AuthFailure['kind']`, and a kind added to the
 * union without a message added to the copy is a type error rather than a blank message.
 */
export const authFailureMessage = (failure: AuthFailure): string =>
  strings.authFailure[failure.kind];
