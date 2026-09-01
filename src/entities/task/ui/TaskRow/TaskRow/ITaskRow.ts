import type { Task } from '@entities/task/model';

export interface ITaskRowProps {
  readonly task: Task;
  /**
   * Derived by the caller, against one instant shared by every row on the pass — see
   * `entities/task/lib/isTaskExpired`. The row is told, rather than asking, because a
   * component that read the clock while rendering would be impure and each row would be
   * judged against a slightly different "now".
   */
  readonly isExpired: boolean;
  readonly isMenuOpen: boolean;
  /** Carries the value the checkbox moved **to**, matching `useToggleTaskDone`. */
  readonly onToggleDone: (isDone: boolean) => void;
  /** The three-dot button. Active in every state, expired included. */
  readonly onToggleMenu: () => void;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
  readonly testID?: string;
}
