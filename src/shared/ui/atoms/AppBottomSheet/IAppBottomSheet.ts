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
  /**
   * Whether a tap on the scrim closes the sheet. True for a sheet that offers a choice — a
   * stray tap is a fair way to decline one. **False for a sheet that asks a destructive
   * question**, where the only answers are its own buttons: the shape is shared, the cost of
   * the action is not, and the difference lives here rather than in two components.
   */
  readonly isDismissableByScrim?: boolean;
  /**
   * Whether the header carries a close button. Off for the same reason as above: a
   * confirmation should be answered, not dismissed.
   */
  readonly hasCloseButton?: boolean;
  readonly accessibilityLabel: string;
  readonly testID?: string;
}
