export interface ICategoryFieldProps {
  /** The task's category. Empty means none — the field is optional. */
  readonly value: string;
  readonly onChange: (next: string) => void;
  /** The distinct categories the loaded tasks carry, sorted. Derived, never stored. */
  readonly suggestions: readonly string[];
  readonly testID: string;
}
