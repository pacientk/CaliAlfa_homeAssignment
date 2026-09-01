export interface IExpiryPickerProps {
  /** The expiry the form currently holds — ISO-8601, or `null` for "never expires". */
  readonly value: string | null;
  /** Leaves the value alone. */
  readonly onCancel: () => void;
  /** `null` is a real answer: it is how the user says the task should never expire. */
  readonly onConfirm: (next: string | null) => void;
  readonly testID: string;
}
