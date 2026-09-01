import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface IAppScrollViewProps {
  readonly children: ReactNode;
  /**
   * Applies the design's 20 pt horizontal screen margin to the scrolling content. Off by
   * default, because a scroll view whose rows bleed to the screen edge is a real layout in
   * this design and would otherwise have to undo the padding.
   */
  readonly hasScreenPadding?: boolean;
  /** The scroll viewport. Use for `flex`, never for the content's own padding. */
  readonly style?: StyleProp<ViewStyle>;
  /** The scrolling content. Composed after the screen padding, so it can add to it. */
  readonly contentContainerStyle?: StyleProp<ViewStyle>;
  readonly testID?: string;
}
