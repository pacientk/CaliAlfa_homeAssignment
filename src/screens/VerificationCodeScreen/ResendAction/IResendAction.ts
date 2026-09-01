export interface IResendActionProps {
  /** What the countdown line prints. Ignored once the wait is over. */
  readonly secondsRemaining: number;
  readonly canResend: boolean;
  readonly onResend: () => void;
}
