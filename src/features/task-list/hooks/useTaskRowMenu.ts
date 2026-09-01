import type { Task } from '@entities/task';
import { useState } from 'react';

export interface IUseTaskRowMenuReturn {
  /** The row whose action menu is open, if any. At most one is open at a time. */
  readonly openMenuTaskId?: string;
  /** The task the confirmation modal is asking about. Absent means no modal. */
  readonly taskPendingDeletion?: Task;
  readonly toggleMenu: (taskId: string) => void;
  readonly closeMenu: () => void;
  /** Opens the confirmation modal for a task and closes the menu it was chosen from. */
  readonly requestDelete: (task: Task) => void;
  /** Dismisses the modal without deleting. The caller performs the delete itself. */
  readonly dismissDelete: () => void;
}

/**
 * The list's two pieces of transient UI state, kept together because they hand off to each
 * other: choosing Delete in a row menu closes that menu and opens the modal.
 *
 * Neither value is data, so neither belongs in the query cache or the sync store. They are
 * held here rather than in the screen so the screen stays a composition — and so the rule
 * that only one menu is open at a time is written once, as "the open id is a single value"
 * rather than as a loop that closes the others.
 */
export const useTaskRowMenu = (): IUseTaskRowMenuReturn => {
  const [openMenuTaskId, setOpenMenuTaskId] = useState<string | undefined>(undefined);
  const [taskPendingDeletion, setTaskPendingDeletion] = useState<Task | undefined>(undefined);

  const closeMenu = (): void => {
    setOpenMenuTaskId(undefined);
  };

  return {
    openMenuTaskId,
    taskPendingDeletion,
    toggleMenu: (taskId: string): void => {
      setOpenMenuTaskId(current => (current === taskId ? undefined : taskId));
    },
    closeMenu,
    requestDelete: (task: Task): void => {
      closeMenu();
      setTaskPendingDeletion(task);
    },
    dismissDelete: (): void => {
      setTaskPendingDeletion(undefined);
    },
  };
};
