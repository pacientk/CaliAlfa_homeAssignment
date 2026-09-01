/**
 * The welcome, phone-number and verification screens.
 *
 * The copy is split by area so that work on different screens does not contend on a
 * single file. `./index.ts` composes the areas back into one frozen `strings` object,
 * which is what every component reads.
 */

export const welcome = {
  title: 'Focus & Flow',
  subtitle: 'Sign in to keep your tasks in sync.',
  continue: 'Get started',
} as const;

export const phoneNumber = {
  title: 'Phone number',
  subtitle: 'We send a one-time code to confirm it is you.',
  submit: 'Send the code',
} as const;

export const verificationCode = {
  title: 'Verification code',
  subtitle: 'Enter the six digits we just sent.',
  submit: 'Verify',
} as const;
