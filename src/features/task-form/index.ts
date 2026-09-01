/**
 * Creating and editing a task: one form, the state and rules behind it, and the pure helpers
 * the two screens need to talk to it.
 *
 * The slice holds no task data and issues no mutation — reading and writing tasks is
 * `task-sync`'s job, and a feature may not import another feature. The screens compose the
 * two, which is also what lets this one be tested without a query client.
 */
export type { IUseTaskFormOptions, IUseTaskFormReturn } from './hooks/useTaskForm';
export { useTaskForm } from './hooks/useTaskForm';
export { categorySuggestions } from './lib/categorySuggestions';
export type { ExpiryDayChoice, ExpirySelection, ExpiryTimeChoice } from './lib/expiryChoices';
export {
  composeExpiry,
  DEFAULT_EXPIRY_TIME_KEY,
  EXPIRY_DAY_CHOICES,
  EXPIRY_TIME_CHOICES,
  matchExpirySelection,
} from './lib/expiryChoices';
export { formatTimestamp } from './lib/formatTimestamp';
export { titleErrorMessage } from './lib/titleErrorMessage';
export type { TaskFormValues } from './model/TaskFormValues';
export {
  emptyTaskFormValues,
  taskFormValuesOf,
  toTaskChanges,
  toTaskDraft,
} from './model/TaskFormValues';
export type { ITaskFormProps } from './ui';
export { TaskForm } from './ui';
