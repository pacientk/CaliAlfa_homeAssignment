import type { IconName } from '@ui/atoms';

export interface IPreferenceRowProps {
  readonly icon: IconName;
  readonly label: string;
  /** The trailing text: a current value, or the word on the "not yet" tag. */
  readonly value: string;
  /** Draws the value as a pill rather than as plain text — C2's "Soon". */
  readonly hasTag: boolean;
  /** Draws the hairline above the row. False on the first row of a card. */
  readonly hasDivider: boolean;
  readonly testID?: string;
}
