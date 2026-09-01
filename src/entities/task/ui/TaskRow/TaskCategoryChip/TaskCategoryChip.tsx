import { AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import type { ITaskCategoryChipProps } from './ITaskCategoryChip';
import { makeTaskCategoryChipStyles } from './TaskCategoryChip.styles';

/**
 * The category pill on a task row.
 *
 * A task's category may be an empty string — the API's own shape allows it — and
 * `TaskRow.dc.html` draws the chip only when there is one (`hasChip: !!p.category`). The
 * guard lives here rather than at the call site so the row cannot forget it.
 */
export const TaskCategoryChip = ({
  category,
  isExpired,
  testID,
}: ITaskCategoryChipProps): JSX.Element | null => {
  const styles = useThemedStyles(makeTaskCategoryChipStyles);

  if (category.length === 0) {
    return null;
  }

  return (
    <AppView
      style={[styles.chip, isExpired ? styles.chipExpired : styles.chipDefault]}
      testID={testID}
    >
      <AppText
        variant="captionMedium"
        color={isExpired ? 'tertiary' : 'secondary'}
        numberOfLines={1}
      >
        {category}
      </AppText>
    </AppView>
  );
};
