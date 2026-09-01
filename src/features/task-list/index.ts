/**
 * The task list's own behaviour: search, expiry, and the transient state of the row menu and
 * the delete confirmation.
 *
 * It holds no task data and issues no mutation. Reading and writing tasks is `task-sync`'s
 * job, and a feature may not import another feature — so the screen composes the two, which
 * is also what keeps this slice testable without a query client.
 */
export { useDebouncedValue } from './hooks/useDebouncedValue';
export { useExpiryNow } from './hooks/useExpiryNow';
export type { IUseTaskRowMenuReturn } from './hooks/useTaskRowMenu';
export { useTaskRowMenu } from './hooks/useTaskRowMenu';
export type { IUseTaskSearchReturn } from './hooks/useTaskSearch';
export { useTaskSearch } from './hooks/useTaskSearch';
export { filterTasksByTitle } from './lib/filterTasksByTitle';
export type { TaskSummary } from './lib/summariseTasks';
export { summariseTasks } from './lib/summariseTasks';
export type { IDeleteTaskDialogProps } from './ui/DeleteTaskDialog';
export { DeleteTaskDialog } from './ui/DeleteTaskDialog';
export type { INewTaskButtonProps } from './ui/NewTaskButton';
export { NewTaskButton } from './ui/NewTaskButton';
