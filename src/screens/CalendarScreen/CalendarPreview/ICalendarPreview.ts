import type { StyleProp, ViewStyle } from 'react-native';

export interface ICalendarPreviewProps {
  /**
   * Placement only. The card owns how it looks; the screen owns where it sits in the column —
   * `docs/architecture/principles.md § O`, which keeps a caller from restyling the primitive.
   */
  readonly style?: StyleProp<ViewStyle>;
}
