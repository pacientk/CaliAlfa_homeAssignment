export interface IOtpCodeRowProps {
  /** The digits entered so far, shortest first. Never longer than six. */
  readonly code: string;
  /** Fires with the sanitised value: digits only, six at most. */
  readonly onCodeChange: (next: string) => void;
  /** Puts every box into the error palette. The message itself is the screen's to draw. */
  readonly hasError: boolean;
  readonly accessibilityLabel: string;
  readonly testID?: string;
}
