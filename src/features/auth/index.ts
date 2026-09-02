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
export type { ConfirmVerificationCode } from './hooks/useConfirmVerificationCode';
export { useConfirmVerificationCode } from './hooks/useConfirmVerificationCode';
export type { ResendCountdown } from './hooks/useResendCountdown';
export { useResendCountdown } from './hooks/useResendCountdown';
export type { SendVerificationCode } from './hooks/useSendVerificationCode';
export { useSendVerificationCode } from './hooks/useSendVerificationCode';
export { authFailureMessage } from './lib/authFailureMessage';
export type { CountryPrefix } from './lib/countryPrefixes';
export { COUNTRY_PREFIXES, DEFAULT_COUNTRY_PREFIX } from './lib/countryPrefixes';
export { formatCountdown } from './lib/formatCountdown';
export { isPlausiblePhoneNumber, sanitisePhoneInput, toE164 } from './lib/phoneNumber';
export { composeE164, isPlausibleNumberParts, sanitiseNationalNumber } from './lib/phoneNumber';
export { AuthError, isAuthError } from './model/AuthError';
export type { AuthFailure } from './model/AuthFailure';
export { toAuthFailure } from './model/AuthFailure';
export type { AuthService, ConfirmationHandle } from './model/AuthService';
export { AuthServiceContext, useAuthService } from './model/authServiceContext';
export { firebaseAuthService } from './model/firebaseAuthService';
export {
  signOut,
  startSessionObserver,
  useIsSessionInitialising,
  useIsSignedIn,
  useSessionPhoneNumber,
} from './model/sessionStore';
export { useVerificationPhoneNumber } from './model/verificationStore';
export type { IAuthPrimaryButtonProps } from './ui/AuthPrimaryButton';
export { AuthPrimaryButton } from './ui/AuthPrimaryButton';
export type { IAuthTopBarProps } from './ui/AuthTopBar';
export { AuthTopBar } from './ui/AuthTopBar';
export { CountryPrefixModal } from './ui/CountryPrefixModal';
export type { IOtpCodeRowProps } from './ui/OtpCodeRow';
export { OTP_CODE_LENGTH, OtpCodeRow } from './ui/OtpCodeRow';
export type { IPhoneNumberFieldProps } from './ui/PhoneNumberField';
export { PhoneNumberField } from './ui/PhoneNumberField';
