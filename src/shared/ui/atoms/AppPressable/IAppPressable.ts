import type { ReactNode } from 'react';
import type { AccessibilityState, StyleProp, ViewStyle } from 'react-native';

/**
 * The roles a tappable element in this app can legitimately have. Narrower than React
 * Native's `AccessibilityRole`, which also covers static content — a pressable is never a
 * `text` or an `image`.
 */
export type PressableRole =
  'button' | 'checkbox' | 'imagebutton' | 'link' | 'menuitem' | 'switch' | 'tab';

/**
 * `accessibilityRole` and `accessibilityLabel` are required, not optional. Every unlabelled
 * button in a shipped app got that way because the prop was optional; making it required
 * moves the omission from a screen-reader audit to a type error.
 */
export interface IAppPressableProps {
  readonly children: ReactNode;
  readonly onPress: () => void;
  readonly accessibilityRole: PressableRole;
  readonly accessibilityLabel: string;
  /** Reads after the label, for a consequence the label does not convey. */
  readonly accessibilityHint?: string;
  /** `checked`, `selected`, `expanded`. `disabled` is derived from `isDisabled` and ignored here. */
  readonly accessibilityState?: Omit<AccessibilityState, 'disabled'>;
  readonly isDisabled?: boolean;
  /**
   * Turns off the press scale. For a control that is already its own feedback — a switch
   * whose knob travels, a checkbox that fills — the scale reads as a button underneath it,
   * which is a second thing happening for one action.
   */
  readonly hasPressFeedback?: boolean;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}
