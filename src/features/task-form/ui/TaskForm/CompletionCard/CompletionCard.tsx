import { strings } from '@lib/strings';
import { AppPressable, AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import { makeCompletionCardStyles } from './CompletionCard.styles';
import type { ICompletionCardProps } from './ICompletionCard';

/**
 * Completion, on the edit screen (FR-11).
 *
 * The whole card is one control with the `switch` role, so the user can press anywhere along
 * the row. The new value travels as the state the control moved to rather than as "flip it",
 * which is what stops two quick presses from racing.
 *
 * There is no checkbox beside the switch any more. Two drawings of one boolean on one row
 * read as two controls, and a reader who sees two has to work out whether they can disagree.
 * The switch is the control the design draws for a setting; the checkbox belongs to a task
 * row, where it is the whole affordance rather than a duplicate of one.
 *
 * It edits the form's value rather than the task: the screen applies it with everything else
 * when the form is saved, so a toggle and a title change cannot land in two different orders.
 */
export const CompletionCard = ({ isDone, onToggle, testID }: ICompletionCardProps): JSX.Element => {
  const styles = useThemedStyles(makeCompletionCardStyles);

  const toggle = (): void => {
    onToggle(!isDone);
  };

  return (
    <AppPressable
      onPress={toggle}
      accessibilityRole="switch"
      accessibilityLabel={strings.taskDetail.completion}
      accessibilityState={{ checked: isDone }}
      style={styles.card}
      testID={testID}
    >
      <AppText variant="body" style={styles.label}>
        {strings.taskDetail.completion}
      </AppText>

      <AppView
        style={[styles.track, isDone ? styles.trackOn : styles.trackOff]}
        testID={testID === undefined ? undefined : `${testID}.track`}
      >
        <AppView style={styles.knob} />
      </AppView>
    </AppPressable>
  );
};
