import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';
import { ScrollView } from 'react-native';

import { makeAppScrollViewStyles } from './AppScrollView.styles';
import type { IAppScrollViewProps } from './IAppScrollView';

/**
 * The project's scroll container.
 *
 * It is for content of a known, bounded length — a form, a settings page, an empty state.
 * A list whose length is driven by data uses `AppFlashList` instead; see
 * `docs/architecture/coding-rules.md § Lists`, which makes the recycling list the default
 * rather than something to retrofit once the list has grown callers.
 *
 * `keyboardShouldPersistTaps="handled"` is a fixed default rather than a prop. Without it a
 * tap on a button while the keyboard is open is swallowed by the dismiss gesture, so the user
 * has to press twice — a defect every form in this app would otherwise be free to reintroduce.
 */
export const AppScrollView = ({
  children,
  hasScreenPadding = false,
  style,
  contentContainerStyle,
  testID,
}: IAppScrollViewProps): JSX.Element => {
  const styles = useThemedStyles(makeAppScrollViewStyles);

  return (
    <ScrollView
      style={style}
      contentContainerStyle={[
        hasScreenPadding ? styles.screenPadding : undefined,
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      testID={testID}
    >
      {children}
    </ScrollView>
  );
};
