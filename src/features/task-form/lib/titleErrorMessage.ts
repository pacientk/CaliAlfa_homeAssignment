import type { TitleRejection } from '@entities/task';
import { strings } from '@lib/strings';

/**
 * One message per rejection — artboard B7 spells out all three and gives them one visual
 * treatment.
 *
 * A lookup on the domain union rather than a chain of booleans: adding a fourth rule to
 * `validateTitle` then fails to compile here instead of silently falling through to the
 * duplicate sentence.
 *
 * The duplicate message quotes the title the user typed. It is not trimmed on the way in —
 * a padded title is rejected as `padded` before it can ever be compared — so what the
 * sentence names is exactly what is in the field.
 */
export const titleErrorMessage = (
  rejection: TitleRejection | undefined,
  title: string,
): string | undefined => {
  if (rejection === undefined) {
    return undefined;
  }

  if (rejection === 'empty') {
    return strings.taskForm.titleError.empty;
  }

  if (rejection === 'padded') {
    return strings.taskForm.titleError.padded;
  }

  return strings.taskForm.titleError.duplicate(title);
};
