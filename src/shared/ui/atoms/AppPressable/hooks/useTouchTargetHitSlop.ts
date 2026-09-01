import { useState } from 'react';
import type { Insets, LayoutChangeEvent } from 'react-native';

/**
 * The iOS accessibility floor, in logical points. It is a constant and is never multiplied by
 * the OS font scale: a touch target is sized for a fingertip, and a fingertip does not grow
 * when the user enlarges their text.
 */
const TOUCH_TARGET_MIN_POINTS = 44;

/** The starting value, before the first layout pass has reported a size. */
const NO_INSET: Insets = { top: 0, right: 0, bottom: 0, left: 0 };

/** Half the shortfall, so the extra area is split evenly on both sides of the axis. */
const insetForAxis = (measuredPoints: number): number =>
  Math.max(0, (TOUCH_TARGET_MIN_POINTS - measuredPoints) / 2);

export interface IUseTouchTargetHitSlopReturn {
  /** Feed to `hitSlop`. Zero on an axis that already clears the floor. */
  readonly hitSlop: Insets;
  /** Feed to `onLayout`. The hook needs the element's real size to know the shortfall. */
  readonly onLayout: (event: LayoutChangeEvent) => void;
}

/**
 * Grows a pressable's *touch* area to 44 pt on each axis without touching its *visual* size.
 *
 * The design draws a 20 pt checkbox and a 28 pt three-dot button; both are correct as drawn,
 * and both are below the floor. Inflating them would change the layout, so the shortfall is
 * paid in `hitSlop` instead — which is invisible, and is what iOS hit-tests against.
 *
 * The size has to be measured rather than declared, because the atom does not know what its
 * caller styled it to be. The layout callback is idempotent: an unchanged measurement returns
 * the existing insets object, so a repeat layout pass does not schedule a re-render.
 */
export const useTouchTargetHitSlop = (): IUseTouchTargetHitSlopReturn => {
  const [hitSlop, setHitSlop] = useState<Insets>(NO_INSET);

  const onLayout = (event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;
    const horizontal = insetForAxis(width);
    const vertical = insetForAxis(height);

    setHitSlop(current =>
      current.left === horizontal && current.top === vertical
        ? current
        : { top: vertical, right: horizontal, bottom: vertical, left: horizontal },
    );
  };

  return { hitSlop, onLayout };
};
