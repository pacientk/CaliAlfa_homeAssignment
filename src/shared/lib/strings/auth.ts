/**
 * The welcome, phone-number and verification screens.
 *
 * The copy is split by area so that work on different screens does not contend on a
 * single file. `./index.ts` composes the areas back into one frozen `strings` object,
 * which is what every component reads.
 *
 * Every visible line below is the line artboards A1–A5 draw. The entries that carry no text
 * on the canvas — accessibility labels and hints — are marked as such, because a screen
 * reader is a surface an artboard cannot show.
 */

export const welcome = {
  /** The eyebrow badge above the headline. Drawn in capitals, so authored in capitals. */
  badge: 'FOCUS & FLOW',
  /** The headline is drawn on two lines, the second one in the brand colour. */
  titleLead: 'Welcome to',
  titleAccent: 'Cognitive Clarity.',
  subtitle: 'Offload your mental clutter into one quiet, reliable list.',
  /** Not drawn: the illustration is decorative, and this is what a screen reader says instead. */
  illustrationLabel: 'Three task cards, the first two completed',
  benefits: {
    capture: {
      title: 'Capture in a tap',
      description: 'Straight from mind to list, no friction.',
    },
    momentum: {
      title: 'See your momentum',
      description: 'Daily progress, counted honestly.',
    },
    privacy: {
      title: 'Yours alone',
      description: 'One account, synced and private.',
    },
  },
  continue: 'Next',
  logInPrompt: 'Already have an account?',
  logIn: 'Log in',
} as const;

export const phoneNumber = {
  /** Not drawn: the back control is an arrow glyph, and a glyph announces nothing. */
  back: 'Back',
  title: "What's your number?",
  subtitle: "We'll text you a six-digit code to confirm it's you.",
  fieldLabel: 'Phone number',
  /**
   * The canvas draws the country prefix in a segment of its own. This app has one field, so
   * the placeholder carries the shape the field expects — including the leading `+`, which is
   * what makes "these digits are a country code" unambiguous without a country picker.
   */
  fieldPlaceholder: '666 55 44 33',
  /** The country segment of the field, and the sheet it opens. */
  prefixAccessibilityLabel: 'Country code',
  prefixSheet: {
    title: 'Country code',
    close: 'Close the country list',
  },
  /** Not drawn: the visible label is two words, and a screen reader needs the whole rule. */
  fieldAccessibilityLabel: 'Phone number, without the country code',
  reassurance: 'Standard rates may apply. Your number is used only to sign you in.',
  submit: 'Next',
} as const;

export const verificationCode = {
  /** Not drawn: see `phoneNumber.back`. */
  back: 'Back',
  title: 'Enter your code',
  sentTo: (phone: string): string => `Sent to ${phone}.`,
  /** Not drawn: six boxes are one field to a screen reader, and this is what it announces. */
  fieldAccessibilityLabel: 'Six-digit verification code',
  resendIn: (clock: string): string => `Resend code in ${clock}`,
  resendPrompt: "Didn't receive a code?",
  resend: 'Resend',
  submit: 'Next',
} as const;

/**
 * One message per `AuthFailure` kind — FR-4, and the reason the failure union carries kinds
 * rather than copy.
 *
 * The canvas draws a single sentence in the error state, "That code is wrong or has expired.
 * Check the message or resend.", because an artboard can only draw one. Splitting it in two is
 * deliberate: the provider distinguishes a wrong code from an expired one, only the first is
 * fixed by retyping, and telling someone to re-check a message they read correctly is exactly
 * the wrong advice a merged message gives.
 */
export const authFailure = {
  invalidCode: 'That code is wrong. Check the message or resend.',
  expiredCode: 'That code has expired. Resend to get a new one.',
  quotaExceeded: 'Too many attempts. Wait a few minutes and try again.',
  invalidPhone: 'That is not a number we can send a code to.',
  network: 'No connection. Signing in is the one thing that needs the network.',
  unknown: 'Something went wrong. Try again.',
} as const;
