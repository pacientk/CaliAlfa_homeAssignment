import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Modal } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '../AppIcon';
import { AppPressable } from '../AppPressable';
import { AppText } from '../AppText';
import { AppView } from '../AppView';
import { makeAppBottomSheetStyles } from './AppBottomSheet.styles';
import type { IAppBottomSheetProps } from './IAppBottomSheet';

/**
 * Artboard A6's bottom sheet: chrome against the bottom edge, body supplied by the caller.
 *
 * **The two layers animate differently, and that is the point.** `Modal`'s own `slide`
 * animation translates everything it contains, scrim included, so the dim would ride up from
 * the bottom edge with the sheet — a curtain sliding in rather than a room dimming. The window
 * is therefore presented with no animation of its own, and the two layers are driven from one
 * shared progress value: the scrim fades, the sheet slides. On the way out the sheet is kept
 * mounted until the animation finishes, because unmounting on the first frame is what makes a
 * dismissal look like a cut.
 *
 * The sheet's travel is its own measured height rather than a guess, so it starts exactly off
 * screen whatever the body turns out to be.
 *
 * Three ways out on a picker — the scrim, the grabber, the close button — which is the design's
 * decision and not an accident. There is no cancel row, because nothing is being committed. A
 * confirmation drops two of the three: see `BottomSheetVariant`.
 *
 * The grabber is drawn but not draggable. A real drag needs a gesture handler and this project
 * deliberately carries no gesture library; the affordance still reads, and the other exits are
 * live.
 */
export const AppBottomSheet = ({
  children,
  isVisible,
  onRequestClose,
  title,
  closeLabel,
  variant = 'picker',
  accessibilityLabel,
  testID,
}: IAppBottomSheetProps): JSX.Element => {
  const styles = useThemedStyles(makeAppBottomSheetStyles);
  const insets = useSafeAreaInsets();
  const isConfirmation = variant === 'confirmation';

  const [isPresented, setIsPresented] = useState(isVisible);
  const progress = useSharedValue(isVisible ? 1 : 0);
  const sheetHeight = useSharedValue(INITIAL_TRAVEL);

  useEffect(() => {
    if (isVisible) {
      setIsPresented(true);
      progress.value = withTiming(1, { duration: ENTER_DURATION_MS });

      return;
    }

    progress.value = withTiming(0, { duration: EXIT_DURATION_MS }, isFinished => {
      if (isFinished === true) {
        runOnJS(setIsPresented)(false);
      }
    });
  }, [isVisible, progress]);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * sheetHeight.value }],
  }));

  const measureSheet = (event: LayoutChangeEvent): void => {
    sheetHeight.value = event.nativeEvent.layout.height;
  };

  return (
    <Modal
      visible={isPresented}
      transparent
      animationType="none"
      onRequestClose={onRequestClose}
      testID={testID}
    >
      <Animated.View style={[styles.scrimLayer, scrimStyle]}>
        <AppPressable
          onPress={isConfirmation ? noop : onRequestClose}
          isDisabled={isConfirmation}
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
          style={styles.scrim}
          testID={testID === undefined ? undefined : `${testID}.scrim`}
        >
          <AppView style={styles.scrim} />
        </AppPressable>
      </Animated.View>

      <Animated.View style={[styles.sheetLayer, sheetStyle]} onLayout={measureSheet}>
        <AppView
          style={[styles.sheet, { paddingBottom: insets.bottom }]}
          accessibilityRole="alert"
          accessibilityLabel={accessibilityLabel}
        >
          <AppView style={styles.grabberBand}>
            <AppView style={styles.grabber} />
          </AppView>

          <AppView style={styles.header}>
            <AppText variant="cardTitle" style={styles.title} accessibilityRole="header">
              {title}
            </AppText>

            {isConfirmation ? null : (
              <AppPressable
                onPress={onRequestClose}
                accessibilityRole="button"
                accessibilityLabel={closeLabel}
                style={styles.close}
                testID={testID === undefined ? undefined : `${testID}.close`}
              >
                <AppIcon name="close" size="size20" color="secondary" />
              </AppPressable>
            )}
          </AppView>

          <AppView style={styles.divider} />

          {children}
        </AppView>
      </Animated.View>
    </Modal>
  );
};

/** A press handler for a scrim that is deliberately inert. */
const noop = (): void => {};

/**
 * Where the sheet sits before it has measured itself. Any value taller than a sheet will do —
 * it only has to be off screen for the first frame, and `onLayout` replaces it immediately.
 */
const INITIAL_TRAVEL = 1000;

const ENTER_DURATION_MS = 220;
const EXIT_DURATION_MS = 180;
