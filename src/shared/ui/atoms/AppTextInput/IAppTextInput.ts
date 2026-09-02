import type { KeyboardTypeOptions, StyleProp, ViewStyle } from 'react-native';

export interface IAppTextInputProps {
  readonly value: string;
  readonly onChangeText: (next: string) => void;
  /** Required: a field with no label is unusable with a screen reader and easy to forget. */
  readonly accessibilityLabel: string;
  /** The visible caption above the field. Omitted where the surrounding copy already names it. */
  readonly label?: string;
  readonly placeholder?: string;
  /**
   * Present means the field is in its error state. The message drives both the styling and
   * the announcement, so the two cannot drift apart — there is deliberately no separate
   * `hasError` flag that could be set without a message, or a message without the styling.
   */
  readonly errorMessage?: string;
  readonly isDisabled?: boolean;
  /**
   * Grows the field to the 96 pt box the task form draws for a description and lets the
   * text wrap. It is a mode of this field rather than a second component: every other
   * property the design gives an input — the four states, the ring widths, the message —
   * is identical, and a `MultilineTextInput` would have to restate all of them.
   */
  readonly isMultiline?: boolean;
  /**
   * Drops the field's own frame — border, fill and horizontal padding — so it can sit inside
   * a composite control whose container draws the frame instead. The phone field is the case
   * it exists for: the canvas draws one bordered box holding a country segment, a divider and
   * the number, and two nested borders is not that.
   */
  readonly isSeamless?: boolean;
  /**
   * Reports focus outward. Only a seamless field needs it, and it needs it for one reason:
   * the container that owns the frame is the one that has to draw the focus ring.
   */
  readonly onFocusChange?: (isFocused: boolean) => void;
  readonly keyboardType?: KeyboardTypeOptions;
  readonly maxLength?: number;
  /** The wrapper around label, field, and message — for layout, never for the field's own look. */
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}
