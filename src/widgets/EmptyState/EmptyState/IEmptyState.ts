import type { IconName } from '@ui/atoms';

/**
 * The two empty states the design draws differ in more than their words (FR-17), so the tone
 * is a named choice rather than something inferred: `brand` is "nothing here yet, go make
 * something" (B4) and `neutral` is "your filter hid everything" (B5).
 */
export type EmptyStateTone = 'brand' | 'neutral';

export interface IEmptyStateProps {
  readonly icon: IconName;
  readonly tone: EmptyStateTone;
  readonly title: string;
  readonly message: string;
  readonly actionLabel: string;
  readonly onAction: () => void;
  /** B4 draws a leading glyph on its button; B5 does not. */
  readonly actionIcon?: IconName;
  /** Centred in whatever space is left (B4), or anchored below the header (B5). */
  readonly isCentred: boolean;
  readonly testID?: string;
}
