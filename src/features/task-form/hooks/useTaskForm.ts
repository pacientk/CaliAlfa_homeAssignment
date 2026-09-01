import type { TitleRejection } from '@entities/task';
import { validateTitle } from '@entities/task';
import { useState } from 'react';

import type { TaskFormValues } from '../model/TaskFormValues';

export interface IUseTaskFormOptions {
  readonly initialValues: TaskFormValues;
  /** Every title the app currently holds. The duplicate rule is checked against these. */
  readonly existingTitles: readonly string[];
  /** Set when a task is being edited: its own title stops counting as a duplicate. */
  readonly editingTaskTitle?: string;
}

export interface IUseTaskFormReturn {
  readonly values: TaskFormValues;
  readonly setTitle: (next: string) => void;
  readonly setDescription: (next: string) => void;
  readonly setCategory: (next: string) => void;
  readonly setExpiresAt: (next: string | null) => void;
  readonly setIsDone: (isNextDone: boolean) => void;
  /** The rule the current title breaks, or `undefined`. Gates the submit button. */
  readonly titleRejection: TitleRejection | undefined;
  /**
   * The rejection to *show*. Same as `titleRejection` once the user has typed, and always
   * `undefined` before that — see the note on the hook.
   */
  readonly visibleTitleRejection: TitleRejection | undefined;
  readonly canSubmit: boolean;
}

/**
 * The form's state and its one rule.
 *
 * Validation is **derived on every render** rather than stored in state next to the value.
 * A stored verdict is a second source of truth that is wrong for one render after every
 * keystroke, which is precisely how a disabled submit button ends up enabled on an invalid
 * title. `validateTitle` is pure and cheap, so there is nothing to cache.
 *
 * Nothing here trims. The rules `validateTitle` implements are rejection rules taken from
 * the assignment's own flow diagram — a padded title is refused, not quietly fixed — so the
 * raw value the user typed is the value that is held, shown and eventually saved.
 *
 * The message and the button are gated differently, on purpose. The button is disabled from
 * the first frame, because an empty form genuinely cannot be submitted. The message waits
 * until the user has touched the field: artboard B6 draws a clean placeholder, and greeting
 * someone with "Give the task a title." before they have had a chance to type reads as an
 * accusation rather than as help. Both derive from the same verdict, so they can never
 * disagree about whether the title is valid — only about whether to say so yet.
 */
export const useTaskForm = ({
  initialValues,
  existingTitles,
  editingTaskTitle,
}: IUseTaskFormOptions): IUseTaskFormReturn => {
  const [values, setValues] = useState<TaskFormValues>(initialValues);
  const [hasTouchedTitle, setHasTouchedTitle] = useState<boolean>(initialValues.title.length > 0);

  const patch = (change: Partial<TaskFormValues>): void => {
    setValues(current => ({ ...current, ...change }));
  };

  const titleRejection = validateTitle({
    raw: values.title,
    existingTitles,
    ...(editingTaskTitle === undefined ? {} : { editingTaskTitle }),
  });

  return {
    values,
    setTitle: (next: string): void => {
      setHasTouchedTitle(true);
      patch({ title: next });
    },
    setDescription: (next: string): void => {
      patch({ description: next });
    },
    setCategory: (next: string): void => {
      patch({ category: next });
    },
    setExpiresAt: (next: string | null): void => {
      patch({ expiresAt: next });
    },
    setIsDone: (isNextDone: boolean): void => {
      patch({ isDone: isNextDone });
    },
    titleRejection,
    visibleTitleRejection: hasTouchedTitle ? titleRejection : undefined,
    canSubmit: titleRejection === undefined,
  };
};
