import type { StyleProp, ViewStyle } from 'react-native';

export interface INewTaskButtonProps {
  readonly onPress: () => void;
  /** Placement only. Where the button floats is the screen's layout decision, not its own. */
  readonly style?: StyleProp<ViewStyle>;
}
