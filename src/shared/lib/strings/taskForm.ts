/**
 * Creating and editing a task.
 *
 * The copy is split by area so that work on different screens does not contend on a
 * single file. `./index.ts` composes the areas back into one frozen `strings` object,
 * which is what every component reads.
 */

/**
 * Artboards B6 and B7 — the create screen, and the two pieces of it that are copy rather
 * than structure.
 */
export const newTask = {
  /** The centred navigation title. */
  title: 'New task',
  submit: 'Add task',
  /** Artboard B6's advice card, which the edit screen does not draw. */
  tip: {
    label: 'PRO TIP',
    body: 'Start the title with a verb.',
  },
} as const;

/** Artboard B8 — the same form, plus the three things only an existing task has. */
export const taskDetail = {
  title: 'Edit task',
  submit: 'Save changes',
  completion: 'Mark as completed',
  createdLabel: 'Created',
  expiresLabel: 'Expires',
  delete: 'Delete task',
} as const;

/**
 * The form itself: shared by both screens, so its copy is shared too.
 *
 * The three title messages are the ones artboard B7 spells out, keyed by the rejection
 * `validateTitle` returns. Keying them off the domain type rather than off a boolean is
 * what stops a fourth rule from silently reusing a third rule's sentence.
 */
export const taskForm = {
  back: 'Back',
  /** Marks a field the user may leave alone. Set beside the label, in a quieter tone. */
  optional: ' · optional',

  title: {
    label: 'Title',
  },

  description: {
    label: 'Description',
    placeholder: "Add any detail you'll want later…",
  },

  category: {
    label: 'Category',
    /** The dashed chip that reveals the free-text field. */
    newCategory: 'New category',
    newCategoryLabel: 'New category name',
  },

  expiry: {
    label: 'Expires',
    /** Drawn inside the field while the task has no expiry — artboard B6. */
    empty: 'No expiry — never expires',
    open: 'Choose when the task expires',
    clear: 'Clear the expiry',
    picker: {
      title: 'Expires',
      day: 'Day',
      time: 'Time',
      today: 'Today',
      tomorrow: 'Tomorrow',
      inThreeDays: 'In 3 days',
      inAWeek: 'In a week',
      never: 'No expiry',
      confirm: 'Done',
    },
  },

  titleError: {
    empty: 'Give the task a title.',
    padded: 'Remove the space before or after the title.',
    duplicate: (title: string): string => `A task called “${title}” already exists.`,
  },
} as const;
