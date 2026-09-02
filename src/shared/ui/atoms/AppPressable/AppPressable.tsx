import type { JSX } from 'react';
import { Pressable } from 'react-native';

import { appPressableStyles } from './AppPressable.styles';
import { useTouchTargetHitSlop } from './hooks/useTouchTargetHitSlop';
import type { IAppPressableProps } from './IAppPressable';

/**
 * Everything tappable in the app. It carries three things no screen should have to remember:
 * the design's press feedback, the disabled contract, and the 44 pt accessibility touch floor.
 *
 * The floor is reached through `hitSlop` measured against the element's own layout — see
 * `hooks/useTouchTargetHitSlop`. It never inflates the visual size, because the visual size
 * is whatever the design says it is.
 */
export const AppPressable = ({
  children,
  onPress,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  isDisabled = false,
  hasPressFeedback = true,
  style,
  testID,
}: IAppPressableProps): JSX.Element => {
  const { hitSlop, onLayout } = useTouchTargetHitSlop();

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      hitSlop={hitSlop}
      onLayout={onLayout}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ ...accessibilityState, disabled: isDisabled }}
      testID={testID}
      style={state => [
        style,
        state.pressed && !isDisabled && hasPressFeedback
          ? appPressableStyles.pressed
          : appPressableStyles.resting,
      ]}
    >
      {children}
    </Pressable>
  );
};
