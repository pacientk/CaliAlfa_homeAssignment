export interface ITaskCategoryChipProps {
  readonly category: string;
  /** An expired row recesses its chip one step, to `containerHighest`. */
  readonly isExpired: boolean;
  readonly testID?: string;
}
