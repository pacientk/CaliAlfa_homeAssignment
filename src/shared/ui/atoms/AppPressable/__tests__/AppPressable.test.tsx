import { lightTheme } from '@ui/tokens';
import type { AccessibilityState, Insets, LayoutChangeEvent, ViewStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import type { ReactTestInstance } from 'react-test-renderer';
import { act } from 'react-test-renderer';

import { firstOf, readHandler, readProp, renderWithTheme } from '../../testing/renderWithTheme';
import { AppPressable } from '../AppPressable';

/** The floor the design and the iOS guidelines both state, restated here so the test owns it. */
const TOUCH_FLOOR = 44;

const renderPressable = (
  onPress: jest.Mock,
  options: { isDisabled?: boolean; hasPressFeedback?: boolean; style?: ViewStyle } = {},
): ReactTestInstance => {
  const renderer = renderWithTheme(
    <AppPressable
      onPress={onPress}
      isDisabled={options.isDisabled}
      hasPressFeedback={options.hasPressFeedback}
      style={options.style}
      accessibilityRole="button"
      accessibilityLabel="Add task"
      accessibilityHint="Opens the new task form"
    >
      <Text>Add task</Text>
    </AppPressable>,
  );

  return firstOf(renderer.root.findAllByType(View), 'View');
};

/** Drives the press through React Native's own Pressability, not through our callback. */
const press = (host: ReactTestInstance): void => {
  act(() => {
    readHandler<[unknown]>(host, 'onClick')({ nativeEvent: {} });
  });
};

const layout = (host: ReactTestInstance, width: number, height: number): void => {
  const event = {
    nativeEvent: { layout: { x: 0, y: 0, width, height } },
  } as LayoutChangeEvent;

  act(() => {
    readHandler<[LayoutChangeEvent]>(host, 'onLayout')(event);
  });
};

const hitSlopOf = (host: ReactTestInstance): Insets => readProp<Insets>(host, 'hitSlop');

describe('AppPressable press handling', () => {
  it('fires onPress when it is enabled', () => {
    const onPress = jest.fn();

    press(renderPressable(onPress));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when it is disabled, and refuses the gesture outright', () => {
    const onPress = jest.fn();
    const host = renderPressable(onPress, { isDisabled: true });

    press(host);

    expect(onPress).not.toHaveBeenCalled();
    // The gesture never starts, so nothing downstream of it can run either.
    expect(readHandler<[]>(host, 'onStartShouldSetResponder')()).toBe(false);
  });

  it('lets the gesture start when it is enabled', () => {
    const host = renderPressable(jest.fn());

    expect(readHandler<[]>(host, 'onStartShouldSetResponder')()).toBe(true);
  });
});

describe('AppPressable accessibility', () => {
  it('renders with the role, label, and hint it was given', () => {
    const host = renderPressable(jest.fn());

    expect(readProp<string>(host, 'accessibilityRole')).toBe('button');
    expect(readProp<string>(host, 'accessibilityLabel')).toBe('Add task');
    expect(readProp<string>(host, 'accessibilityHint')).toBe('Opens the new task form');
  });

  it('reports the disabled state to assistive technology, and only when it is disabled', () => {
    const enabled = renderPressable(jest.fn());
    const disabled = renderPressable(jest.fn(), { isDisabled: true });

    expect(readProp<AccessibilityState>(enabled, 'accessibilityState').disabled).toBe(false);
    expect(readProp<AccessibilityState>(disabled, 'accessibilityState').disabled).toBe(true);
  });
});

describe('AppPressable touch floor', () => {
  it('reaches 44 pt on both axes for an element drawn smaller than the floor', () => {
    const host = renderPressable(jest.fn(), { style: { width: 30, height: 30 } });

    layout(host, 30, 30);

    const hitSlop = hitSlopOf(host);
    const touchableWidth = 30 + (hitSlop.left ?? 0) + (hitSlop.right ?? 0);
    const touchableHeight = 30 + (hitSlop.top ?? 0) + (hitSlop.bottom ?? 0);

    expect(touchableWidth).toBeGreaterThanOrEqual(TOUCH_FLOOR);
    expect(touchableHeight).toBeGreaterThanOrEqual(TOUCH_FLOOR);
  });

  it('reaches the floor exactly, so the constant is never multiplied by the font scale', () => {
    const host = renderPressable(jest.fn(), { style: { width: 20, height: 20 } });

    layout(host, 20, 20);

    const hitSlop = hitSlopOf(host);

    // 20 + 12 + 12 = 44. Had the floor been scaled by the theme's 1.3 cap it would be 57.2.
    expect(20 + (hitSlop.left ?? 0) + (hitSlop.right ?? 0)).toBe(TOUCH_FLOOR);
    expect(20 + (hitSlop.top ?? 0) + (hitSlop.bottom ?? 0)).toBe(TOUCH_FLOOR);
    expect(lightTheme.maxFontSizeMultiplier).toBeGreaterThan(1);
  });

  it('adds nothing to an element that already clears the floor', () => {
    const host = renderPressable(jest.fn(), { style: { width: 60, height: 52 } });

    layout(host, 60, 52);

    expect(hitSlopOf(host)).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });

  it('grows one axis without touching the other', () => {
    const host = renderPressable(jest.fn(), { style: { width: 200, height: 28 } });

    layout(host, 200, 28);

    const hitSlop = hitSlopOf(host);

    expect(hitSlop.left).toBe(0);
    expect(hitSlop.right).toBe(0);
    expect(28 + (hitSlop.top ?? 0) + (hitSlop.bottom ?? 0)).toBe(TOUCH_FLOOR);
  });

  it('never inflates the visual size to reach the floor', () => {
    const host = renderPressable(jest.fn(), { style: { width: 20, height: 20 } });

    layout(host, 20, 20);

    const style = StyleSheet.flatten(readProp<ViewStyle>(host, 'style'));

    expect(style.width).toBe(20);
    expect(style.height).toBe(20);
  });
});

const transformOf = (host: ReactTestInstance): unknown =>
  StyleSheet.flatten(readProp<ViewStyle>(host, 'style')).transform;

/** The minimum a synthetic touch has to carry for React Native's Pressability to accept it. */
const touchEvent = (): unknown => ({
  nativeEvent: { changedTouches: [], identifier: 1, touches: [] },
  currentTarget: 0,
  target: 0,
  persist: () => undefined,
});

describe('AppPressable press feedback', () => {
  it('rests at scale 1 and does not shrink until it is pressed', () => {
    expect(transformOf(renderPressable(jest.fn()))).toEqual([{ scale: 1 }]);
  });

  it('shrinks to the design 0.98 while the finger is down, and springs back on release', () => {
    jest.useFakeTimers();

    try {
      const host = renderPressable(jest.fn());

      act(() => {
        readHandler<[unknown]>(host, 'onStartShouldSetResponder')(touchEvent());
        readHandler<[unknown]>(host, 'onResponderGrant')(touchEvent());
        jest.runOnlyPendingTimers();
      });

      expect(transformOf(host)).toEqual([{ scale: 0.98 }]);

      act(() => {
        readHandler<[unknown]>(host, 'onResponderRelease')(touchEvent());
        jest.runOnlyPendingTimers();
      });

      expect(transformOf(host)).toEqual([{ scale: 1 }]);
    } finally {
      jest.useRealTimers();
    }
  });

  it('does not shrink when the caller says the control is its own feedback', () => {
    // A switch whose knob travels, or a checkbox that fills, already answers the touch.
    // Scaling the thing underneath is a second event for one action.
    jest.useFakeTimers();

    try {
      const host = renderPressable(jest.fn(), { hasPressFeedback: false });

      act(() => {
        readHandler<[unknown]>(host, 'onStartShouldSetResponder')(touchEvent());
        readHandler<[unknown]>(host, 'onResponderGrant')(touchEvent());
        jest.runOnlyPendingTimers();
      });

      expect(transformOf(host)).toEqual([{ scale: 1 }]);
    } finally {
      jest.useRealTimers();
    }
  });

  it('does not shrink when it is disabled — a dead control gives no feedback', () => {
    jest.useFakeTimers();

    try {
      const host = renderPressable(jest.fn(), { isDisabled: true });

      act(() => {
        readHandler<[unknown]>(host, 'onResponderGrant')(touchEvent());
        jest.runOnlyPendingTimers();
      });

      expect(transformOf(host)).toEqual([{ scale: 1 }]);
    } finally {
      jest.useRealTimers();
    }
  });
});
