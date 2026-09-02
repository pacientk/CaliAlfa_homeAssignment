import type { ReactNode } from 'react';

export interface IAppBottomSheetProps {
  /** The sheet's body. It sizes itself; the sheet is the chrome around it. */
  readonly children: ReactNode;
  /** Nothing renders while this is false — the native window is not presented at all. */
  readonly isVisible: boolean;
  /**
   * Called by all three ways out: the scrim, the grabber's downward drag, and the close
   * button. The hardware back gesture routes here too.
   */
  readonly onRequestClose: () => void;
  /** The header label. Copy lives with the caller; an atom carrying product wording would not. */
  readonly title: string;
  /** What a screen reader calls the close control, for the same reason. */
  readonly closeLabel: string;
  readonly accessibilityLabel: string;
  readonly testID?: string;
}
