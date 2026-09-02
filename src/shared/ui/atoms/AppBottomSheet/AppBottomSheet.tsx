import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';
import { Modal } from 'react-native';
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
 * Three ways out, which is the design's decision and not an accident: the scrim, the grabber's
 * downward drag, and the close button. There is no cancel row, because nothing here is being
 * committed — a text action would overstate the stakes of closing a picker.
 *
 * The scrim dismisses by default, because a sheet that offers a choice can fairly be declined
 * with a stray tap. A sheet that asks a destructive question turns that off along with the
 * close button, so the only answers are its own two buttons. The shape is shared; the cost of
 * the action is not, and that distinction lives in these two props rather than in a second
 * component.
 *
 * The grabber is drawn but not draggable. A real drag needs a gesture handler and an animated
 * translation, and this app deliberately carries no gesture library; the affordance still reads
 * as "this can be dismissed", and the other two ways out are both live.
 */
/** A press handler for the scrim that is deliberately inert. */
const noop = (): void => {};

export const AppBottomSheet = ({
  children,
  isVisible,
  onRequestClose,
  title,
  closeLabel,
  isDismissableByScrim = true,
  hasCloseButton = true,
  accessibilityLabel,
  testID,
}: IAppBottomSheetProps): JSX.Element => {
  const styles = useThemedStyles(makeAppBottomSheetStyles);
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onRequestClose}
      testID={testID}
    >
      <AppPressable
        onPress={isDismissableByScrim ? onRequestClose : noop}
        isDisabled={!isDismissableByScrim}
        accessibilityRole="button"
        accessibilityLabel={closeLabel}
        style={styles.scrim}
        testID={testID === undefined ? undefined : `${testID}.scrim`}
      >
        <AppView
          style={[styles.sheet, { paddingBottom: insets.bottom }]}
          accessibilityRole="alert"
          accessibilityLabel={accessibilityLabel}
        >
          <AppView style={styles.grabberBand}>
            <AppView style={styles.grabber} />
          </AppView>

          <AppView style={styles.header}>
            <AppText
              variant="label"
              color="secondary"
              style={styles.title}
              accessibilityRole="header"
            >
              {title}
            </AppText>

            {hasCloseButton ? (
              <AppPressable
                onPress={onRequestClose}
                accessibilityRole="button"
                accessibilityLabel={closeLabel}
                style={styles.close}
                testID={testID === undefined ? undefined : `${testID}.close`}
              >
                <AppIcon name="close" size="size20" color="secondary" />
              </AppPressable>
            ) : null}
          </AppView>

          <AppView style={styles.divider} />

          {children}
        </AppView>
      </AppPressable>
    </Modal>
  );
};
