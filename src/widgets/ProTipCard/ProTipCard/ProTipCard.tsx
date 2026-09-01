import { strings } from '@lib/strings';
import { AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import { makeProTipCardStyles } from './ProTipCard.styles';

/**
 * The advice card that closes artboard B1's list. Subordinate by construction: it sits below
 * everything, it is not interactive, and it carries no state — so it can never be the reason
 * a row is out of view.
 */
export const ProTipCard = (): JSX.Element => {
  const styles = useThemedStyles(makeProTipCardStyles);

  return (
    <AppView style={styles.card}>
      <AppText variant="overline" color="accent">
        {strings.taskList.proTip.label}
      </AppText>
      <AppText variant="bodySmall" color="secondary" style={styles.body}>
        {strings.taskList.proTip.body}
      </AppText>
    </AppView>
  );
};
