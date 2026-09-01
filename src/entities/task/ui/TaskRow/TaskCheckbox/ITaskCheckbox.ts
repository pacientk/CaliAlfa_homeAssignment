export interface ITaskCheckboxProps {
  readonly isDone: boolean;
  /** Expired means disabled: the fill goes flat and the control stops accepting a press. */
  readonly isExpired: boolean;
  /** Announces which task this box belongs to. */
  readonly accessibilityLabel: string;
  /** Receives the value the control moved **to**, never a request to flip the stored one. */
  readonly onToggle: (isDone: boolean) => void;
  readonly testID?: string;
}
