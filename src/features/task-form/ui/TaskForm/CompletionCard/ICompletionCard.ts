export interface ICompletionCardProps {
  readonly isDone: boolean;
  /** Receives the value the control moved **to**, never a request to flip the stored one. */
  readonly onToggle: (isDone: boolean) => void;
  readonly testID?: string;
}
