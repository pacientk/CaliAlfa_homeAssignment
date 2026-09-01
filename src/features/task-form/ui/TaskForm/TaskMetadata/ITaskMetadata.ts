export interface ITaskMetadataProps {
  /** ISO-8601, always present: every task carries the moment it was written. */
  readonly createdAt: string;
  /** ISO-8601, or `null` when the task never expires — the column is then omitted. */
  readonly expiresAt: string | null;
  readonly testID?: string;
}
