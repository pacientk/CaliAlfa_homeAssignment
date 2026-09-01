import { strings } from '@lib/strings';
import { AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import { makeFormTipCardStyles } from './FormTipCard.styles';

/**
 * The advice card artboard B6 closes the create form with. Static, non-interactive, and
 * drawn only on the create screen — B8 replaces it with the task's own metadata.
 *
 * It is not `widgets/ProTipCard`: that widget is the list's card, which carries different
 * copy, different type and different padding, and takes no props. Parameterising it to
 * serve both would put two screens' design decisions in one file and make either one
 * unable to move without the other.
 */
export const FormTipCard = (): JSX.Element => {
  const styles = useThemedStyles(makeFormTipCardStyles);

  return (
    <AppView style={styles.card}>
      <AppText variant="overline" color="accent">
        {strings.newTask.tip.label}
      </AppText>
      <AppText variant="caption" color="secondary" style={styles.body}>
        {strings.newTask.tip.body}
      </AppText>
    </AppView>
  );
};
