import { strings } from '@lib/strings';
import { AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import type { IMomentumCardProps } from './IMomentumCard';
import { makeMomentumCardStyles } from './MomentumCard.styles';

const RATIO_AS_PERCENT = 100;

/**
 * FR-16: how much of the list is done, counting expired tasks towards both numbers.
 *
 * The counts come from the whole cache rather than from the filtered view, so a search does
 * not make the day look less finished than it is.
 */
export const MomentumCard = ({ summary }: IMomentumCardProps): JSX.Element => {
  const styles = useThemedStyles(makeMomentumCardStyles);
  const { completedCount, totalCount, completedRatio } = summary;

  const hasTasks = totalCount > 0;
  const progressLabel = strings.taskList.momentum.progressLabel(completedCount, totalCount);

  return (
    <AppView style={styles.card}>
      <AppView>
        <AppText variant="cardTitle" color="onPrimary" accessibilityRole="header">
          {strings.taskList.momentum.title}
        </AppText>
        <AppText variant="bodySmall" color="onPrimaryContainer" style={styles.subtitle}>
          {hasTasks
            ? strings.taskList.momentum.progress(completedCount, totalCount)
            : strings.taskList.momentum.empty}
        </AppText>
      </AppView>

      <AppView style={styles.track} accessibilityRole="summary" accessibilityLabel={progressLabel}>
        {/* A runtime percentage — the documented exception to the no-inline-styles rule. */}
        <AppView style={[styles.fill, { width: `${completedRatio * RATIO_AS_PERCENT}%` }]} />
      </AppView>
    </AppView>
  );
};
