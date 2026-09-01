import type { Task } from '@entities/task';
import type { TaskFormValues } from '@features/task-form/model/TaskFormValues';

/**
 * One form, two screens.
 *
 * Create and edit differ in exactly the ways this interface allows them to: the record the
 * form starts from, the words on the primary action, what that action does, and whether
 * there is anything to delete. Everything else — the layout, the validation, the category
 * suggestions, the expiry picker — is the same code, because it is the same form.
 *
 * `editedTask` carries all of "this is an edit" on its own: it prefills the fields, it
 * excludes its own title from the duplicate rule, and it brings artboard B8's completion
 * switch and metadata with it. A separate `isEditing` flag could disagree with it; this
 * cannot.
 */
export interface ITaskFormProps {
  /** The centred navigation title — "New task" or "Edit task". */
  readonly screenTitle: string;
  readonly submitLabel: string;
  /** Absent on create. */
  readonly editedTask?: Task;
  /** Every title the app holds, for the duplicate rule. */
  readonly existingTitles: readonly string[];
  /** The distinct categories of the loaded tasks. */
  readonly categorySuggestions: readonly string[];
  readonly onSubmit: (values: TaskFormValues) => void;
  readonly onBack: () => void;
  /** Only an existing task can be deleted, so only the edit screen passes this. */
  readonly onDelete?: () => void;
}
