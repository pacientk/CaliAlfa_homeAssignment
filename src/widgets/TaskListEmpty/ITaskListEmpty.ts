export interface ITaskListEmptyProps {
  /** Whether the cache holds tasks at all. False means the list is empty; true means the
   * search hid them. The two are different situations and get different copy. */
  readonly hasTasks: boolean;
  /** The settled search text, quoted back to the user in the no-results title. */
  readonly query: string;
  readonly hiddenCount: number;
  readonly onClearSearch: () => void;
  readonly onCreateTask: () => void;
}
