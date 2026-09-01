import { strings } from '@lib/strings';
import { AppIcon, AppPressable, AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import type { ITaskFormHeaderProps } from './ITaskFormHeader';
import { makeTaskFormHeaderStyles } from './TaskFormHeader.styles';

/**
 * The form's own navigation bar. React Navigation's header is off across the app
 * (`navigation/constants/screenOptions.ts`) because every screen in this design draws its
 * own, and this is the one the two form screens share.
 */
export const TaskFormHeader = ({ title, onBack, testID }: ITaskFormHeaderProps): JSX.Element => {
  const styles = useThemedStyles(makeTaskFormHeaderStyles);

  return (
    <AppView style={styles.header}>
      {/*
       * The title is drawn *before* the back arrow so the arrow sits above it. The title
       * spans the whole bar — it is centred on the frame, not on the space beside the arrow
       * — and a later sibling wins the touch, so drawing it second made the arrow untappable.
       * The canvas says the same thing with `pointer-events: none`; sibling order is how a
       * React Native view says it without the text primitive having to grow a prop.
       */}
      <AppText variant="title" color="accent" accessibilityRole="header" style={styles.title}>
        {title}
      </AppText>

      <AppPressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel={strings.taskForm.back}
        testID={testID}
      >
        <AppIcon name="arrow_back" size="size24" color="primary" />
      </AppPressable>
    </AppView>
  );
};
