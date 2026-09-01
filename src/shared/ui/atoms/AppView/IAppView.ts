import type { ReactNode } from 'react';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';

/**
 * The surface is deliberately narrow. `AppView` exists so that no file outside this
 * directory imports `View`; it is not a place to re-expose all of `ViewProps`, because every
 * prop added here is one more thing a screen can reach for instead of a token.
 */
export interface IAppViewProps {
  readonly children?: ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  /** Present so a container can be announced as one element, e.g. a summary row. */
  readonly accessibilityLabel?: string;
  /** Set when the container itself is meaningful — `header`, `alert`, `list`. */
  readonly accessibilityRole?: 'header' | 'alert' | 'list' | 'summary' | 'none';
  readonly onLayout?: (event: LayoutChangeEvent) => void;
  readonly testID?: string;
}
