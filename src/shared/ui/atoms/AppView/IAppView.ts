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
  /**
   * Lets taps through the parts of a view that draw nothing. An absolutely positioned
   * overlay needs it: without it the strip swallows every touch across its whole box, and a
   * banner that blocks the list under it is worse than no banner.
   */
  readonly pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
  readonly onLayout?: (event: LayoutChangeEvent) => void;
  readonly testID?: string;
}
