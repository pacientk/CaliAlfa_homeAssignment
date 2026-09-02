import { strings } from '@lib/strings';
import { AppPressable, AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import { makeCompletionCardStyles } from './CompletionCard.styles';
import type { ICompletionCardProps } from './ICompletionCard';

/**
 * Completion, on the edit screen (FR-11).
 *
 * The switch is the control; the row is not. Making the whole card pressable gave a settings
 * row the press-scale of a button and a tap target the width of the screen — a label that
 * looks like text but answers to touch. The switch keeps its own 44 pt floor through the
 * pressable's hit area, so nothing is harder to hit than it was.
 *
 * It also asks for no press scale. A switch is already its own feedback: the knob travels.
 * Scaling the track underneath is a second thing happening for one action.
 *
 * The new value travels as the state the control moved to rather than as "flip it", which is
 * what stops two quick presses from racing.
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
    <AppView style={styles.card} testID={testID === undefined ? undefined : `${testID}.row`}>
      <AppText variant="body" style={styles.label}>
        {strings.taskDetail.completion}
      </AppText>

      <AppPressable
        onPress={toggle}
        accessibilityRole="switch"
        accessibilityLabel={strings.taskDetail.completion}
        accessibilityState={{ checked: isDone }}
        hasPressFeedback={false}
        style={[styles.track, isDone ? styles.trackOn : styles.trackOff]}
        testID={testID}
      >
        <AppView style={styles.knob} />
      </AppPressable>
    </AppView>
  );
};
