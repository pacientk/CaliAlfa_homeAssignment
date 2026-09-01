import { strings } from '@lib/strings';
import { AppIcon, AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import { makeFocusModeBlockStyles } from './FocusModeBlock.styles';

/**
 * Decorative, and labelled as such on sheet D: it reports no state, toggles nothing, and is
 * not interactive. It exists because the canvas draws it, and it is built as a plain block
 * rather than as a control so that nobody later wires a mode behind it by accident.
 */
export const FocusModeBlock = (): JSX.Element => {
  const styles = useThemedStyles(makeFocusModeBlockStyles);

  return (
    <AppView style={styles.block}>
      <AppIcon name="auto_awesome" size="size16" style={styles.glyph} />
      <AppText variant="chipLabel" color="secondary">
        {strings.taskList.focusMode}
      </AppText>
    </AppView>
  );
};
