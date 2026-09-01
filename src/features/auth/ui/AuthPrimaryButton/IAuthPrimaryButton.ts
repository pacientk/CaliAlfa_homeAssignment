import type { IconName } from '@ui/atoms';

export interface IAuthPrimaryButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  /** Drawn after the label. Only artboard A1 has one. */
  readonly icon?: IconName;
  readonly isDisabled?: boolean;
  readonly testID?: string;
}
