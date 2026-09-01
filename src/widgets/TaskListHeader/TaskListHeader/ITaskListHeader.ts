import type { TaskSummary } from '@features/task-list';

export interface ITaskListHeaderProps {
  readonly summary: TaskSummary;
  /** The live field value, not the debounced one — the field must never lag the user. */
  readonly searchQuery: string;
  readonly onSearchQueryChange: (next: string) => void;
  readonly onClearSearchQuery: () => void;
  /**
   * Artboard B4 hides the field: with nothing in the list there is nothing to search, and a
   * disabled-looking control would only invite a tap that does nothing.
   */
  readonly hasSearchField: boolean;
  /** The decorative block sits above the field only while the list has rows to focus on. */
  readonly hasFocusModeBlock: boolean;
}
