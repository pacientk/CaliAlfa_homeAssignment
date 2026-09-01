import type { JSX } from 'react';
import { View } from 'react-native';

import type { IAppViewProps } from './IAppView';

/**
 * The project's layout box. It adds no behaviour and holds no styles of its own — its whole
 * job is to be the single import site for `View`, so that the lint rule which bans raw React
 * Native primitives outside this directory has somewhere to point callers at.
 *
 * There is no `AppView.styles.ts` for the same reason: a styles module here would be an
 * empty file, and `docs/architecture/principles.md § KISS` prefers the absent abstraction to
 * the vacant one.
 */
export const AppView = ({
  children,
  style,
  accessibilityLabel,
  accessibilityRole,
  onLayout,
  testID,
}: IAppViewProps): JSX.Element => (
  <View
    style={style}
    accessibilityLabel={accessibilityLabel}
    accessibilityRole={accessibilityRole}
    onLayout={onLayout}
    testID={testID}
  >
    {children}
  </View>
);
