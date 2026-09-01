import { formatTimestamp } from '@features/task-form/lib/formatTimestamp';
import { strings } from '@lib/strings';
import { AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import type { ITaskMetadataProps } from './ITaskMetadata';
import { makeTaskMetadataStyles } from './TaskMetadata.styles';

/**
 * The two facts about a task that are read rather than edited — artboard B8.
 *
 * The expiry column is absent, not blank, when the task never expires: a labelled column with
 * nothing under it reads as data that failed to load.
 */
export const TaskMetadata = ({ createdAt, expiresAt, testID }: ITaskMetadataProps): JSX.Element => {
  const styles = useThemedStyles(makeTaskMetadataStyles);

  return (
    <AppView style={styles.row} testID={testID}>
      <AppView>
        <AppText variant="caption" color="tertiary">
          {strings.taskDetail.createdLabel}
        </AppText>
        <AppText variant="caption" color="secondary">
          {formatTimestamp(createdAt)}
        </AppText>
      </AppView>

      {expiresAt === null ? null : (
        <AppView>
          <AppText variant="caption" color="tertiary">
            {strings.taskDetail.expiresLabel}
          </AppText>
          <AppText variant="caption" color="secondary">
            {formatTimestamp(expiresAt)}
          </AppText>
        </AppView>
      )}
    </AppView>
  );
};
