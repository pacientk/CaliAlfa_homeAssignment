import type { ReactNode } from 'react';

export interface IAppModalProps {
  readonly children: ReactNode;
  /** Nothing renders while this is false — the native window is not presented at all. */
  readonly isVisible: boolean;
  /** The hardware back gesture, and the only way out that is not one of the card's buttons. */
  readonly onRequestClose: () => void;
  /** Announced when the window is presented, so a screen reader says what it is looking at. */
  readonly accessibilityLabel: string;
  readonly testID?: string;
}
