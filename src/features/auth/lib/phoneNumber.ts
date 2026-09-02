/**
 * Turning what someone typed into what the provider accepts.
 *
 * Deliberately not a phone-validation library. The provider is the authority on whether a
 * number exists — it is the one that has to deliver an SMS to it — and a client-side library
 * that disagrees with it produces the worst failure mode there is: a real number the app
 * refuses to send to. So the rules here gate the button on *plausibility* and leave validity
 * to Firebase, which is what T-008's specification asks for.
 */

/**
 * E.164 allows a country code plus a subscriber number of at most fifteen digits in total,
 * and no assigned number is shorter than eight. Outside that range it cannot be a phone
 * number in any country, which is the only thing this module claims to know.
 */
const MIN_E164_DIGITS = 8;
const MAX_E164_DIGITS = 15;

/** Everything the field rejects: it accepts digits, the spaces people group them with, and `+`. */
const REJECTED_INPUT = /[^\d +]/g;
const PLUS = /\+/g;
const NON_DIGITS = /\D/g;

/**
 * What the field is allowed to hold as the user types.
 *
 * A `+` survives only in first position, because that is the only position where it means
 * anything: E.164 spells the international prefix once, at the front.
 */
export const sanitisePhoneInput = (raw: string): string => {
  const body = raw.replace(REJECTED_INPUT, '').replace(PLUS, '');

  return raw.startsWith('+') ? `+${body}` : body;
};

/** The digits alone, with the grouping spaces and the prefix removed. */
const digitsOf = (raw: string): string => raw.replace(NON_DIGITS, '');

/**
 * The form the provider is called with: a leading `+` and nothing but digits after it.
 *
 * It does not invent a country code for a number typed without one. A national number
 * silently promoted to some default country is a message delivered to a stranger, so the
 * plausibility gate below insists on the `+` and the user supplies the country.
 */
export const toE164 = (raw: string): string => `+${digitsOf(raw)}`;

/**
 * Whether the number is worth sending. Three conditions, all cheap and all certain: an
 * international prefix, at least a shortest-possible number, at most a longest-possible one.
 * Everything past that is the provider's judgement rather than ours.
 */
export const isPlausiblePhoneNumber = (raw: string): boolean => {
  if (!raw.startsWith('+')) {
    return false;
  }

  const { length } = digitsOf(raw);

  return length >= MIN_E164_DIGITS && length <= MAX_E164_DIGITS;
};

/**
 * What the national half of the field is allowed to hold.
 *
 * Same rule as `sanitisePhoneInput` minus the plus: the country segment carries the
 * international prefix now, so a `+` typed into the number can only be a mistake, and one
 * silently kept there would produce `+972+34…` on the wire.
 */
export const sanitiseNationalNumber = (raw: string): string => raw.replace(REJECTED_NATIONAL, '');

/** Digits and the spaces people group them with. Nothing else, and no plus. */
const REJECTED_NATIONAL = /[^\d ]/g;

/**
 * The chosen country plus the typed number, in the form the provider is called with.
 *
 * This is what makes the picker worth having: the prefix is a fact the field holds rather
 * than something parsed back out of a string, so the composed value is always well formed
 * and the screen no longer has to insist the user type the plus themselves.
 */
export const composeE164 = (dialCode: string, nationalNumber: string): string =>
  `${dialCode}${digitsOf(nationalNumber)}`;

/**
 * Whether the pair is worth sending. It defers to the same plausibility rule as before,
 * applied to the composed number, so there is one definition of "plausible" and not two.
 */
export const isPlausibleNumberParts = (dialCode: string, nationalNumber: string): boolean =>
  isPlausiblePhoneNumber(composeE164(dialCode, nationalNumber));
