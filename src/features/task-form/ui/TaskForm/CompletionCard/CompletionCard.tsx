import { strings } from '@lib/strings';
import { AppIcon, AppPressable, AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import { makeCompletionCardStyles } from './CompletionCard.styles';
import type { ICompletionCardProps } from './ICompletionCard';

/**
 * Completion, on the edit screen (FR-11).
 *
 * The whole card is one control with the `switch` role: the box and the track are two
 * drawings of the same state, and the design puts them on one row precisely so the user can
 * press anywhere along it. The new value travels as the state the control moved to rather
 * than as "flip it", which is what stops two quick presses from racing.
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
      <AppView style={[styles.box, isDone ? styles.boxChecked : styles.boxUnchecked]}>
        {isDone ? <AppIcon name="check" size="size16" color="onPrimary" /> : null}
      </AppView>

      <AppText variant="body" style={styles.label}>
        {strings.taskDetail.completion}
      </AppText>

      <AppView style={[styles.track, isDone ? styles.trackOn : styles.trackOff]}>
        <AppView style={styles.knob} />
      </AppView>
    </AppPressable>
  );
};
