import type { ReactNode } from 'react';

/**
 * What kind of question the sheet is asking. One prop rather than three switches, because
 * the three behaviours it decides are not independent — they are one intent seen from three
 * angles, and a caller that could mix them (a destructive question with a close button, say)
 * could only get it wrong.
 *
 * - `picker` — offers a choice. Quiet header, a close button, and a scrim that dismisses,
 *   because a stray tap is a fair way to decline a choice.
 * - `confirmation` — asks a question with a cost. Full-size heading, no close button, and an
 *   inert scrim, because a stray tap on the backdrop is not an answer to "delete this
 *   permanently?".
 */
export type BottomSheetVariant = 'picker' | 'confirmation';

export interface IAppBottomSheetProps {
  /** The sheet's body. It sizes itself; the sheet is the chrome around it. */
  readonly children: ReactNode;
  /** Nothing renders while this is false — the native window is not presented at all. */
  readonly isVisible: boolean;
  /**
   * Called by every way out the variant allows: the close button and the scrim on a picker,
   * the hardware back gesture on both.
   */
  readonly onRequestClose: () => void;
  /** The header text. Copy lives with the caller; an atom carrying product wording would not. */
  readonly title: string;
  /** What a screen reader calls the close control, for the same reason. */
  readonly closeLabel: string;
  readonly variant?: BottomSheetVariant;
  readonly accessibilityLabel: string;
  readonly testID?: string;
}
