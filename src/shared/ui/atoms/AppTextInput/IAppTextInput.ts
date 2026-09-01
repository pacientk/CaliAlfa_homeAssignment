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
  readonly keyboardType?: KeyboardTypeOptions;
  readonly maxLength?: number;
  /** The wrapper around label, field, and message — for layout, never for the field's own look. */
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}
