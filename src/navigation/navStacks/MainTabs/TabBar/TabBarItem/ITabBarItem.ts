import type { IconName } from '@ui/atoms';

export interface ITabBarItemProps {
  readonly icon: IconName;
  /** Drawn under the pill, and read out as the tab's accessibility label. */
  readonly label: string;
  readonly isFocused: boolean;
  readonly onPress: () => void;
  readonly testID?: string;
}
