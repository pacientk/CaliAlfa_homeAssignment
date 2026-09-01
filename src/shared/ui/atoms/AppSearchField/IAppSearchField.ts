import type { StyleProp, ViewStyle } from 'react-native';

/**
 * The design draws two separate input components, and this is the second of them: sheet D
 * lists "TEXT INPUT · RADIUS 12, 52 HIGH" and "SEARCH FIELD · RADIUS 16, 48 HIGH" side by
 * side, with different heights, radii, borders and a leading glyph. `AppTextInput` is the
 * first; widening it with a variant flag to also be the second would be exactly the
 * modification `docs/architecture/principles.md § Open/Closed` forbids.
 */
export interface IAppSearchFieldProps {
  readonly value: string;
  readonly onChangeText: (next: string) => void;
  /** Clears the field. Wired to the circular button the canvas draws once the field is filled. */
  readonly onClear: () => void;
  readonly accessibilityLabel: string;
  /** The clear button's own label — user-facing copy, so the caller owns it. */
  readonly clearAccessibilityLabel: string;
  readonly placeholder?: string;
  /** Layout only. The field's own look comes from the canvas and is not a caller's choice. */
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}
