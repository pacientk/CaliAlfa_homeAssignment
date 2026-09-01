/**
 * The three title rules the assignment states in its own flow diagram, as one pure
 * function.
 *
 * They are **rejection** rules, not normalisation: a padded title is refused rather
 * than quietly trimmed, because that is what the diagram says. The caller keeps the
 * raw value and shows a message; nothing here rewrites the user's input.
 */
export type TitleRejection =
  /** Empty, or nothing but whitespace. */
  | 'empty'
  /** Leading or trailing whitespace around a non-empty title. */
  | 'padded'
  /** Repeats a title the app already holds. */
  | 'duplicate';

export interface TitleValidationInput {
  /** Exactly what the user typed. Never trimmed on their behalf. */
  raw: string;
  /** Titles of the tasks currently cached, in whatever form the server returned them. */
  existingTitles: readonly string[];
  /**
   * The title the edited task started with, when a task is being edited rather than
   * created. It is excluded from the duplicate check, so leaving a title untouched is
   * always accepted — including for the two records the seed data already calls
   * "Gloves", which the rule constrains going forward but does not retroactively
   * invalidate.
   */
  editingTaskTitle?: string;
}

/** Titles compare case-insensitively, and after trimming, on both sides. */
const normaliseForComparison = (title: string): string => title.trim().toLowerCase();

/**
 * Returns the rule the title breaks, or `undefined` when it is acceptable.
 *
 * Evaluation order is part of the contract: `"   "` is `empty` rather than `padded`,
 * because "the title is empty" is the more useful thing to tell the user.
 */
export const validateTitle = (input: TitleValidationInput): TitleRejection | undefined => {
  const { raw, existingTitles, editingTaskTitle } = input;
  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    return 'empty';
  }

  if (trimmed !== raw) {
    return 'padded';
  }

  const candidate = normaliseForComparison(trimmed);

  if (editingTaskTitle !== undefined && normaliseForComparison(editingTaskTitle) === candidate) {
    return undefined;
  }

  if (existingTitles.some(existing => normaliseForComparison(existing) === candidate)) {
    return 'duplicate';
  }

  return undefined;
};
