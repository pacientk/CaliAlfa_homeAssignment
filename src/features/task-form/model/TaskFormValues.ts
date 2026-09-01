import type { Task, TaskChanges, TaskDraft } from '@entities/task';

/**
 * What the form holds while it is being edited.
 *
 * It is deliberately not a `Task` and not a `TaskDraft`. A form value is *what the user has
 * typed*, which for the expiry is a three-state thing — a moment, or explicitly nothing —
 * and for the id, the created timestamp and the local bookkeeping is nothing at all. The
 * two conversions below are the only places the form's shape meets the domain's, so a
 * screen never assembles a payload by hand.
 */
export interface TaskFormValues {
  title: string;
  description: string;
  category: string;
  isDone: boolean;
  /** `null` — not `undefined`, not `''` — is the value that means "never expires". */
  expiresAt: string | null;
}

/** A create starts empty and, per FR-7, not done. */
export const emptyTaskFormValues = (): TaskFormValues => ({
  title: '',
  description: '',
  category: '',
  isDone: false,
  expiresAt: null,
});

/**
 * An edit starts at the record.
 *
 * `expiresAt ?? null` is the whole of AC-3's "an absent expiry renders as empty rather than
 * as a default date": the domain type spells absence as `undefined` and the form spells it
 * as `null`, and nothing in between is allowed to invent a date.
 */
export const taskFormValuesOf = (task: Task): TaskFormValues => ({
  title: task.title,
  description: task.description,
  category: task.category,
  isDone: task.isDone,
  expiresAt: task.expiresAt ?? null,
});

/**
 * `createdAt` is passed in rather than read here: it is the moment the user wrote the task,
 * which is the caller's to decide, and reading a clock inside a converter would make it
 * impure and untestable.
 */
export const toTaskDraft = (values: TaskFormValues, createdAt: string): TaskDraft => ({
  title: values.title,
  description: values.description,
  category: values.category,
  isDone: values.isDone,
  createdAt,
  expiresAt: values.expiresAt,
});

/**
 * Every field is sent, including `expiresAt`.
 *
 * `TaskChanges` lets a field be omitted, and omitting `expiresAt` would leave the stored
 * expiry alone — which is exactly wrong for a form whose user has just cleared it. The form
 * knows the intended value of all five fields, so it states all five.
 */
export const toTaskChanges = (values: TaskFormValues): TaskChanges => ({
  title: values.title,
  description: values.description,
  category: values.category,
  isDone: values.isDone,
  expiresAt: values.expiresAt,
});
