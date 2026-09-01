export interface IExpiryFieldProps {
  /** ISO-8601, or `null` for a task that never expires. */
  readonly value: string | null;
  readonly onChange: (next: string | null) => void;
  readonly testID: string;
}
