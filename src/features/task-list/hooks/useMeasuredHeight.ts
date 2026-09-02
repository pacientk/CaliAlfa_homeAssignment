import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

export interface IUseMeasuredHeight {
  /** Zero until the first layout pass. Callers position against it, so zero is a safe start. */
  readonly height: number;
  readonly onLayout: (event: LayoutChangeEvent) => void;
}

/**
 * Reports how tall an element actually turned out to be.
 *
 * It exists because the app's heights are minimums rather than fixed numbers — a header holds
 * text and grows with the OS text size — so anything positioned against one has to measure it
 * instead of assuming the token. The task list's sync banner is the case that needed it: it
 * hangs from the bottom of the header, and a hard 52 would have it overlapping the title the
 * moment someone turns their text size up.
 */
export const useMeasuredHeight = (): IUseMeasuredHeight => {
  const [height, setHeight] = useState(0);

  return {
    height,
    onLayout: (event: LayoutChangeEvent): void => {
      setHeight(event.nativeEvent.layout.height);
    },
  };
};
