import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';
import { Modal } from 'react-native';

import { AppView } from '../AppView';
import { makeAppModalStyles } from './AppModal.styles';
import type { IAppModalProps } from './IAppModal';

/**
 * A centred card over a scrim, presented in its own native window.
 *
 * The scrim deliberately does not dismiss on tap. The one modal this app has is a
 * destructive confirmation (artboard B3), and a stray tap on the backdrop is not an answer
 * to "delete this permanently?" — the two buttons are.
 */
export const AppModal = ({
  children,
  isVisible,
  onRequestClose,
  accessibilityLabel,
  testID,
}: IAppModalProps): JSX.Element => {
  const styles = useThemedStyles(makeAppModalStyles);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
      testID={testID}
    >
      <AppView
        style={styles.scrim}
        accessibilityRole="alert"
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </AppView>
    </Modal>
  );
};
